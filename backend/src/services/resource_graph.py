"""
AzureResourceGraphService — queries Azure Resource Graph to discover resources
across authorized subscriptions and persists inventory snapshots to the database.
"""

import asyncio
import json
import logging
from datetime import datetime, timezone
from typing import List, Optional
from sqlmodel import Session, select

from azure.identity import DefaultAzureCredential
from azure.mgmt.resourcegraph import ResourceGraphClient
from azure.mgmt.resourcegraph.models import QueryRequest, QueryRequestOptions, ResultFormat

from src.config.settings import AZURE_DEFAULT_SUBSCRIPTIONS, REQUEST_TIMEOUT_SECONDS
from src.models.resource import ResourceInventory
from src.models.scan import ScanSnapshot
from src.services.enrichers import EnricherRegistry

logger = logging.getLogger(__name__)

# KQL query to fetch essential resource inventory metadata
RESOURCE_GRAPH_KQL = """
Resources
| project id, name, type, subscriptionId, resourceGroup, location, tags, sku, kind, properties.provisioningState
| order by type asc, name asc
"""


class AzureResourceGraphService:
    """
    Executes Azure Resource Graph queries, performs deep ARM enrichment,
    and stores discovery snapshots.
    """

    MAX_RETRIES = 3

    def __init__(
        self,
        session: Session,
        credential: Optional[DefaultAzureCredential] = None,
    ) -> None:
        self._session = session
        self._credential = credential or DefaultAzureCredential()

    async def run_scan(
        self, subscription_ids: Optional[List[str]] = None
    ) -> ScanSnapshot:
        """
        Initiate and execute a full inventory scan for specified subscriptions.
        Runs Discovery (Stage 1) followed by Deep ARM Enrichment (Stage 2).
        """
        target_subs = subscription_ids or AZURE_DEFAULT_SUBSCRIPTIONS
        if not target_subs:
            raise ValueError(
                "No subscription IDs provided for scan and AZURE_DEFAULT_SUBSCRIPTIONS is empty."
            )

        # 1. Initialize ScanSnapshot record in pending state
        scan = ScanSnapshot(
            subscription_ids=json.dumps(target_subs),
            status="discovering",
            stages=json.dumps({"discovery": "in_progress", "enrichment": "pending", "pricing": "pending"}),
            errors=json.dumps([]),
        )
        self._session.add(scan)
        self._session.commit()
        self._session.refresh(scan)

        start_time = datetime.now(timezone.utc)
        errors: list[str] = []

        try:
            # 2. Stage 1: Query Resource Graph asynchronously
            raw_resources = await self._execute_query_with_retry(target_subs)

            # 3. Parse and persist discovered resources
            resource_records: list[ResourceInventory] = []
            distinct_types: set[str] = set()

            for item in raw_resources:
                r_type = item.get("type", "Unknown")
                distinct_types.add(r_type)

                # Parse SKU info if present
                sku_data = item.get("sku") or {}
                sku_name = sku_data.get("name") if isinstance(sku_data, dict) else None
                sku_tier = sku_data.get("tier") if isinstance(sku_data, dict) else None

                # Parse tags as JSON string
                tags_data = item.get("tags")
                tags_str = json.dumps(tags_data) if tags_data else None

                # Parse provisioning state
                prov_state = item.get("properties_provisioningState") or item.get("provisioningState")

                record = ResourceInventory(
                    scan_id=scan.id,
                    azure_resource_id=item.get("id", ""),
                    name=item.get("name", ""),
                    resource_type=r_type,
                    subscription_id=item.get("subscriptionId", ""),
                    resource_group=item.get("resourceGroup", ""),
                    location=item.get("location", ""),
                    sku_name=sku_name,
                    sku_tier=sku_tier,
                    kind=item.get("kind"),
                    tags=tags_str,
                    provisioning_state=prov_state,
                )
                resource_records.append(record)
                self._session.add(record)

            self._session.commit()

            # 4. Stage 2: Deep ARM Enrichment for supported core resource types
            scan.status = "enriching"
            scan.stages = json.dumps({"discovery": "completed", "enrichment": "in_progress", "pricing": "pending"})
            self._session.add(scan)
            self._session.commit()

            enriched_count = 0
            for record in resource_records:
                if EnricherRegistry.is_supported(record.resource_type):
                    enricher = EnricherRegistry.get_enricher(record.resource_type)
                    if enricher:
                        try:
                            enrichment_dict = await enricher.enrich(record, self._credential)
                            record.enrichment_data = json.dumps(enrichment_dict)
                            record.enriched_at = datetime.now(timezone.utc)
                            self._session.add(record)
                            if enrichment_dict.get("enrichment_status") == "succeeded":
                                enriched_count += 1
                        except Exception as e_err:
                            logger.warning("Enrichment error for %s: %s", record.name, e_err)

            # 5. Complete scan snapshot
            end_time = datetime.now(timezone.utc)
            duration = (end_time - start_time).total_seconds()

            scan.status = "completed"
            scan.total_resources = len(resource_records)
            scan.resources_enriched = enriched_count
            scan.resource_types_found = json.dumps(sorted(list(distinct_types)))
            scan.stages = json.dumps({"discovery": "completed", "enrichment": "completed", "pricing": "pending"})
            scan.completed_at = end_time
            scan.duration_seconds = round(duration, 2)

            self._session.add(scan)
            self._session.commit()
            self._session.refresh(scan)
            logger.info(
                "Scan %s completed: %d resources found, %d enriched across %d subscriptions.",
                scan.id, len(resource_records), enriched_count, len(target_subs)
            )
            return scan

        except Exception as err:
            logger.exception("Resource Graph scan failed for scan ID %s", scan.id)
            errors.append(str(err))
            end_time = datetime.now(timezone.utc)

            scan.status = "failed"
            scan.errors = json.dumps(errors)
            scan.stages = json.dumps({"discovery": "failed", "enrichment": "skipped", "pricing": "skipped"})
            scan.completed_at = end_time
            scan.duration_seconds = round((end_time - start_time).total_seconds(), 2)

            self._session.add(scan)
            self._session.commit()
            self._session.refresh(scan)
            return scan

    # ------------------------------------------------------------------
    # Private Helper Methods
    # ------------------------------------------------------------------

    async def _execute_query_with_retry(self, subscription_ids: List[str]) -> list[dict]:
        """
        Execute KQL query against Azure Resource Graph SDK in a threadpool with retries and pagination.
        """
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(
            None, self._sync_query_all_pages, subscription_ids
        )

    def _sync_query_all_pages(self, subscription_ids: List[str]) -> list[dict]:
        """Synchronous Resource Graph SDK call handling pagination via skip_token."""
        client = ResourceGraphClient(credential=self._credential)
        all_results: list[dict] = []
        skip_token: Optional[str] = None

        while True:
            options = QueryRequestOptions(
                result_format=ResultFormat.OBJECT_ARRAY,
                skip_token=skip_token,
            )
            query_request = QueryRequest(
                subscriptions=subscription_ids,
                query=RESOURCE_GRAPH_KQL,
                options=options,
            )

            for attempt in range(1, self.MAX_RETRIES + 1):
                try:
                    response = client.resources(query_request)
                    data = response.data or []
                    all_results.extend(data)

                    skip_token = response.skip_token
                    break  # Success, exit retry loop
                except Exception as err:
                    if attempt < self.MAX_RETRIES:
                        wait = 2 ** (attempt - 1)
                        logger.warning("ARG query attempt %d/%d failed: %s. Retrying in %ds...", attempt, self.MAX_RETRIES, err, wait)
                        import time
                        time.sleep(wait)
                    else:
                        raise err

            if not skip_token:
                break

        return all_results
