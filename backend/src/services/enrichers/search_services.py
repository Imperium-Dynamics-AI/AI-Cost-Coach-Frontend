"""
Enricher for Azure AI Search Services.
"""

import asyncio
import logging
from typing import Dict, Optional
from azure.identity import DefaultAzureCredential
from azure.mgmt.search import SearchManagementClient

from src.models.resource import ResourceInventory
from src.services.enrichers.base import BaseEnricher, EnricherRegistry

logger = logging.getLogger(__name__)


@EnricherRegistry.register
class SearchServiceEnricher(BaseEnricher):
    """Enriches Azure AI Search services with replica counts, partition counts, and semantic search status."""

    resource_type = "Microsoft.Search/searchServices"

    async def enrich(
        self,
        resource: ResourceInventory,
        credential: Optional[DefaultAzureCredential] = None,
    ) -> Dict:
        cred = credential or DefaultAzureCredential()
        loop = asyncio.get_running_loop()

        return await loop.run_in_executor(
            None, self._sync_enrich, resource, cred
        )

    def _sync_enrich(
        self, resource: ResourceInventory, credential: DefaultAzureCredential
    ) -> Dict:
        try:
            client = SearchManagementClient(
                credential=credential,
                subscription_id=resource.subscription_id,
            )

            service = client.services.get(
                resource_group_name=resource.resource_group,
                search_service_name=resource.name,
            )

            replica_count = service.replica_count or 1
            partition_count = service.partition_count or 1
            search_sku = service.sku.name if service.sku else "Basic"
            hosting_mode = str(service.hosting_mode) if service.hosting_mode else "default"

            # Check semantic search tier if available
            semantic_search = "disabled"
            if hasattr(service, "semantic_search") and service.semantic_search:
                semantic_search = str(service.semantic_search)

            return {
                "sku_name": search_sku,
                "replica_count": replica_count,
                "partition_count": partition_count,
                "total_search_units": replica_count * partition_count,
                "hosting_mode": hosting_mode,
                "semantic_search": semantic_search,
                "status": str(service.status) if service.status else "running",
                "enrichment_status": "succeeded",
            }

        except Exception as err:
            logger.warning("SearchService enrichment failed for %s: %s", resource.name, err)
            return {
                "enrichment_status": "failed",
                "error": str(err),
            }
