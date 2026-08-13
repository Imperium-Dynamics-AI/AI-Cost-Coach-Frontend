"""
PricingEngine — dynamic Azure Retail Prices API ingestion, dynamic OData query building,
normalization, ambiguity resolution, and post-scan auto-pricing.
"""

import asyncio
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional
import httpx
from sqlmodel import Session, select, col

from src.config.settings import AZURE_PRICES_BASE_URL, AZURE_API_VERSION, REQUEST_TIMEOUT_SECONDS
from src.models.pricing import NormalizedPrice
from src.models.resource import ResourceInventory
from src.models.scan import ScanSnapshot

logger = logging.getLogger(__name__)

# Map Azure Resource Graph types to Azure Retail Prices API filter rules
RESOURCE_TYPE_FILTER_MAP: Dict[str, Dict[str, str]] = {
    "microsoft.cognitiveservices/accounts": {
        "filter_type": "productName",
        "name": "Azure OpenAI",
    },
    "microsoft.search/searchservices": {
        "filter_type": "serviceName",
        "name": "Azure Cognitive Search",
    },
    "microsoft.storage/storageaccounts": {
        "filter_type": "serviceName",
        "name": "Storage",
    },
    "microsoft.web/sites": {
        "filter_type": "serviceName",
        "name": "Azure App Service",
    },
    "microsoft.web/serverfarms": {
        "filter_type": "serviceName",
        "name": "Azure App Service",
    },
    "microsoft.compute/virtualmachines": {
        "filter_type": "serviceName",
        "name": "Virtual Machines",
    },
    "microsoft.containerregistry/registries": {
        "filter_type": "serviceName",
        "name": "Container Registry",
    },
    "microsoft.keyvault/vaults": {
        "filter_type": "serviceName",
        "name": "Key Vault",
    },
    "microsoft.operationalinsights/workspaces": {
        "filter_type": "serviceName",
        "name": "Log Analytics",
    },
    "microsoft.insights/components": {
        "filter_type": "serviceName",
        "name": "Application Insights",
    },
    "microsoft.app/containerapps": {
        "filter_type": "serviceName",
        "name": "Container Apps",
    },
}


class PricingEngine:
    """
    Generalized engine for dynamic Azure retail price lookups, caching,
    and post-scan inventory reference pricing.

    Usage:
        engine = PricingEngine(session)
        prices = await engine.query_prices(product_name="Azure App Service", region="eastus")
        await engine.auto_price_scan_inventory(scan_id="...")
    """

    MAX_RETRIES = 3
    MAX_PAGES = 5  # Safety cap on multi-page follow-ups per query

    def __init__(self, session: Session, client: Optional[httpx.AsyncClient] = None) -> None:
        self._session = session
        self._client = client

    async def query_prices(
        self,
        product_name: Optional[str] = None,
        service_name: Optional[str] = None,
        sku_name: Optional[str] = None,
        meter_name: Optional[str] = None,
        region: Optional[str] = "eastus",
        currency: Optional[str] = "USD",
        billing_term: Optional[str] = None,
    ) -> List[NormalizedPrice]:
        """
        Dynamically query Azure Retail Prices API, normalize records, persist to DB,
        and return matching NormalizedPrice objects.
        """
        filter_parts = []
        if product_name:
            filter_parts.append(f"productName eq '{product_name}'")
        elif service_name:
            filter_parts.append(f"serviceName eq '{service_name}'")

        if sku_name:
            filter_parts.append(f"skuName eq '{sku_name}'")
        if meter_name:
            filter_parts.append(f"meterName eq '{meter_name}'")

        if region:
            filter_parts.append(f"armRegionName eq '{region}'")

        if not filter_parts:
            filter_parts.append("armRegionName eq 'eastus'")

        odata_filter = " and ".join(filter_parts)

        # Check local DB cache first
        statement = select(NormalizedPrice)
        if product_name:
            statement = statement.where(col(NormalizedPrice.product_name).ilike(f"%{product_name}%"))
        if service_name:
            statement = statement.where(col(NormalizedPrice.service_name).ilike(f"%{service_name}%"))
        if sku_name:
            statement = statement.where(col(NormalizedPrice.sku_name).ilike(f"%{sku_name}%"))
        if meter_name:
            statement = statement.where(col(NormalizedPrice.meter_name).ilike(f"%{meter_name}%"))
        if region:
            statement = statement.where(NormalizedPrice.region == region)
        if currency:
            statement = statement.where(NormalizedPrice.currency_code == currency)
        if billing_term:
            statement = statement.where(NormalizedPrice.billing_term == billing_term)

        cached = self._session.exec(statement).all()
        if cached:
            logger.info("Found %d cached price records for filter: %s", len(cached), odata_filter)
            return cached

        # Fetch live from Azure Retail Prices API
        raw_items = await self._fetch_retail_prices_http(odata_filter, currency)
        if not raw_items:
            logger.warning("No Azure retail prices found for filter: %s", odata_filter)
            return []

        # Normalize, resolve primary meter ambiguity, and save
        normalized_records = self._normalize_and_upsert(raw_items, default_region=region or "eastus")
        return normalized_records

    async def auto_price_scan_inventory(self, scan_id: str) -> int:
        """
        Post-scan hook: Automatically fetches retail prices for all discovered resource SKUs/regions
        and updates the scan snapshot stage to 'completed'.
        """
        scan = self._session.get(ScanSnapshot, scan_id)
        if not scan:
            logger.warning("Auto-pricing skipped: Scan ID '%s' not found.", scan_id)
            return 0

        # Update stage to in_progress
        scan.stages = self._update_stage(scan.stages, "pricing", "in_progress")
        self._session.add(scan)
        self._session.commit()

        resources = self._session.exec(
            select(ResourceInventory).where(ResourceInventory.scan_id == scan_id)
        ).all()

        distinct_queries: set[tuple[str, str, str, str]] = set()
        for r in resources:
            rule = RESOURCE_TYPE_FILTER_MAP.get(r.resource_type.lower())
            if rule:
                ftype = rule["filter_type"]
                fname = rule["name"]
                region = r.location or "eastus"
                raw_sku = r.sku_name or ""

                # Ignore generic account tier SKUs (like S0 or Free) during bulk pricing queries
                if raw_sku.upper() in ("S0", "FREE", "STANDARD"):
                    sku = ""
                else:
                    sku = raw_sku

                if ftype == "productName":
                    distinct_queries.add(("product", fname, sku, region))
                else:
                    distinct_queries.add(("service", fname, sku, region))

        priced_count = 0
        for qtype, name, sku, region in distinct_queries:
            try:
                if qtype == "product":
                    records = await self.query_prices(
                        product_name=name,
                        sku_name=sku if sku else None,
                        region=region,
                    )
                else:
                    records = await self.query_prices(
                        service_name=name,
                        sku_name=sku if sku else None,
                        region=region,
                    )
                priced_count += len(records)
            except Exception as err:
                logger.warning("Auto-pricing failed for (%s, %s, %s): %s", name, sku, region, err)

        # Mark pricing stage completed
        scan.stages = self._update_stage(scan.stages, "pricing", "completed")
        self._session.add(scan)
        self._session.commit()
        logger.info("Auto-pricing completed for scan %s: %d price records updated.", scan_id, priced_count)
        return priced_count

    def get_prices_for_resource(self, resource: ResourceInventory) -> List[NormalizedPrice]:
        """
        Look up cached reference prices matching a specific discovered resource.
        Uses enrichment_data to narrow down to ONLY the exact relevant price meters.
        """
        import json

        rule = RESOURCE_TYPE_FILTER_MAP.get(resource.resource_type.lower())

        # If resource type is unmapped and has no SKU, return empty list
        if not rule and not resource.sku_name:
            return []

        # Parse enrichment data once
        enrichment = {}
        if resource.enrichment_data:
            try:
                enrichment = json.loads(resource.enrichment_data)
            except Exception:
                pass

        rtype = resource.resource_type.lower()

        # --- Per-Type Precision Filtering ---

        if rtype == "microsoft.cognitiveservices/accounts":
            return self._price_cognitive_services(resource, enrichment)

        if rtype == "microsoft.search/searchservices":
            return self._price_search_service(resource, enrichment)

        if rtype == "microsoft.storage/storageaccounts":
            return self._price_storage_account(resource, enrichment)

        if rtype in ("microsoft.web/serverfarms",):
            return self._price_app_service_plan(resource, enrichment)

        if rtype in ("microsoft.web/sites",):
            return self._price_web_app(resource, enrichment)

        if rtype == "microsoft.compute/virtualmachines":
            return self._price_virtual_machine(resource, enrichment)

        if rtype == "microsoft.containerregistry/registries":
            return self._price_container_registry(resource, enrichment)

        # --- Generic Fallback for mapped but non-enriched types ---
        statement = select(NormalizedPrice).where(NormalizedPrice.region == resource.location)
        if rule:
            if rule["filter_type"] == "productName":
                statement = statement.where(col(NormalizedPrice.product_name).ilike(f"%{rule['name']}%"))
            else:
                statement = statement.where(col(NormalizedPrice.service_name).ilike(f"%{rule['name']}%"))
        if resource.sku_name:
            statement = statement.where(col(NormalizedPrice.sku_name).ilike(f"%{resource.sku_name}%"))

        return self._session.exec(statement).all()

    # ------------------------------------------------------------------
    # Per-Type Precision Price Helpers
    # ------------------------------------------------------------------

    def _price_cognitive_services(self, resource: ResourceInventory, enrichment: dict) -> List[NormalizedPrice]:
        """
        Azure OpenAI: Use deployed_models[].model_name + sku_name (GlobalStandard/Standard)
        to return ONLY Input + Output token meters for each deployed model.
        """
        deployed_models = enrichment.get("deployed_models", [])
        if not deployed_models:
            return []

        # Fetch all Azure OpenAI prices (using eastus as canonical catalog region)
        region = resource.location or "eastus"
        statement = select(NormalizedPrice).where(
            col(NormalizedPrice.product_name).ilike("%Azure OpenAI%"),
            NormalizedPrice.region == region,
        )
        all_openai_prices = self._session.exec(statement).all()

        # Fallback to eastus if no prices found for the specific region
        if not all_openai_prices and region != "eastus":
            statement = select(NormalizedPrice).where(
                col(NormalizedPrice.product_name).ilike("%Azure OpenAI%"),
                NormalizedPrice.region == "eastus",
            )
            all_openai_prices = self._session.exec(statement).all()

        result = []
        for model in deployed_models:
            model_name = (model.get("model_name") or "").lower()
            deploy_sku = (model.get("sku_name") or "").lower()

            if not model_name:
                continue

            # Map deployment sku_name to Azure pricing SKU suffix candidates
            # GlobalStandard → ["glbl", "global"], Standard → ["regnl", "regional"], DataZone → ["data zone", "datazone"]
            if "global" in deploy_sku:
                sku_suffixes = ["glbl", "global"]
            elif "datazone" in deploy_sku.replace(" ", ""):
                sku_suffixes = ["data zone", "datazone"]
            else:
                sku_suffixes = ["regnl", "regional"]

            # Excluded sub-meter keywords (fine-tuning, audio, TTS, batch, cached, grader, transcribe)
            excluded_keywords = ["-ft ", "ft model", "tts", "aud", "grader", "transcribe", "batch", "cached", "dev ft"]

            for p in all_openai_prices:
                sku_lower = p.sku_name.lower()

                # Must contain the model name
                if model_name not in sku_lower:
                    continue

                # Must match one of the deployment type suffixes (glbl/global/regnl/regional/data zone)
                if not any(s in sku_lower for s in sku_suffixes):
                    continue

                # Must NOT be a specialized sub-meter
                if any(x in sku_lower for x in excluded_keywords):
                    continue

                # Embedding models do not use "inp"/"outp" in SKU names
                if "embed" in model_name:
                    result.append(p)
                elif "inp" in sku_lower or "outp" in sku_lower:
                    result.append(p)

        return result

    def _price_search_service(self, resource: ResourceInventory, enrichment: dict) -> List[NormalizedPrice]:
        """
        Azure AI Search: Use enrichment sku_name (Basic/Standard/Free) to return
        the single hourly unit rate for that specific SKU tier.
        """
        search_sku = enrichment.get("sku_name") or resource.sku_name or "Basic"

        statement = select(NormalizedPrice).where(
            col(NormalizedPrice.service_name).ilike("%Cognitive Search%"),
            NormalizedPrice.region == resource.location,
            col(NormalizedPrice.sku_name).ilike(f"%{search_sku}%"),
        )
        prices = self._session.exec(statement).all()

        # Filter to the primary hourly unit meter
        primary = [p for p in prices if p.is_primary_meter and "unit" in p.meter_name.lower()]
        return primary if primary else prices

    def _price_storage_account(self, resource: ResourceInventory, enrichment: dict) -> List[NormalizedPrice]:
        """
        Azure Storage: Use enrichment access_tier (Hot/Cool) + replication type (LRS/GRS)
        to build a precise SKU like "Hot LRS" and return the primary Blob Storage Data Stored meter.
        """
        raw_access_tier = enrichment.get("access_tier", "Hot")
        # Clean enum prefix if present (e.g. "AccessTier.HOT" → "Hot")
        if "." in str(raw_access_tier):
            access_tier = str(raw_access_tier).split(".")[-1].capitalize()
        else:
            access_tier = str(raw_access_tier).capitalize()

        sku_full = enrichment.get("sku_name", resource.sku_name or "Standard_LRS")

        # Extract replication suffix from sku_name (e.g. "Standard_LRS" → "LRS")
        replication = sku_full.split("_")[-1] if "_" in sku_full else "LRS"

        # Build precise SKU filter: "Hot LRS"
        precise_sku = f"{access_tier} {replication}"

        statement = select(NormalizedPrice).where(
            col(NormalizedPrice.service_name).ilike("%Storage%"),
            NormalizedPrice.region == resource.location,
            col(NormalizedPrice.sku_name).ilike(f"%{precise_sku}%"),
        )
        prices = self._session.exec(statement).all()

        # Filter specifically for primary "Blob Storage" or "General Block Blob v2" Data Stored meter
        blob_stored = [
            p for p in prices
            if "data stored" in p.meter_name.lower() and p.product_name in ("Blob Storage", "General Block Blob v2")
        ]
        # Filter further to primary meter or first tier (0-50TB tier)
        primary = [p for p in blob_stored if p.is_primary_meter]
        return primary[:2] if primary else (blob_stored[:2] if blob_stored else prices[:2])

    def _price_app_service_plan(self, resource: ResourceInventory, enrichment: dict) -> List[NormalizedPrice]:
        """
        App Service Plan: Use enrichment sku_name (B1/P1v2/Y1/S1) to match exact hourly meter.
        """
        plan_sku = enrichment.get("sku_name") or resource.sku_name
        if not plan_sku:
            return []

        # Y1 is the Serverless/Dynamic Consumption plan (free tier with 1M free executions)
        if str(plan_sku).upper() in ("Y1", "DYNAMIC"):
            now = datetime.now(timezone.utc)
            return [
                NormalizedPrice(
                    id="y1-dynamic-free-tier",
                    product_name="Azure App Service Dynamic Plan (Serverless)",
                    sku_name="Y1",
                    meter_name="Y1 Consumption (Free Tier)",
                    service_name="Azure App Service",
                    region=resource.location or "eastus",
                    currency_code="USD",
                    retail_price=0.0,
                    unit_of_measure="1 Hour",
                    billing_term="Consumption",
                    price_type="Consumption",
                    is_primary_meter=True,
                    last_synced_at=now,
                )
            ]

        statement = select(NormalizedPrice).where(
            col(NormalizedPrice.service_name).ilike("%App Service%"),
            NormalizedPrice.region == resource.location,
            col(NormalizedPrice.meter_name).ilike(f"%{plan_sku}%"),
        )
        prices = self._session.exec(statement).all()

        # Filter to primary consumption meters only
        primary = [p for p in prices if p.is_primary_meter]
        return primary if primary else prices

    def _price_web_app(self, resource: ResourceInventory, enrichment: dict) -> List[NormalizedPrice]:
        """
        Web App (Microsoft.Web/sites): Web apps themselves are free; the cost is on the App Service Plan.
        Return empty with a note that pricing is on the associated plan.
        """
        # Web apps are billed through their App Service Plan, not individually
        return []

    def _price_virtual_machine(self, resource: ResourceInventory, enrichment: dict) -> List[NormalizedPrice]:
        """
        Virtual Machine: Use enrichment vm_size (Standard_B2s) + os_type (Linux/Windows)
        to return the exact hourly compute meter.
        """
        vm_size = enrichment.get("vm_size") or resource.sku_name
        os_type = enrichment.get("os_type", "Linux")

        if not vm_size:
            return []

        # Normalize vm_size for search (e.g. "Standard_B2s" → "B2s")
        size_short = vm_size.replace("Standard_", "").replace("standard_", "")

        statement = select(NormalizedPrice).where(
            col(NormalizedPrice.service_name).ilike("%Virtual Machines%"),
            NormalizedPrice.region == resource.location,
            col(NormalizedPrice.sku_name).ilike(f"%{size_short}%"),
        )
        prices = self._session.exec(statement).all()

        # Filter by OS type (Linux vs Windows) using product_name
        os_filtered = [
            p for p in prices
            if os_type.lower() in p.product_name.lower()
        ]

        # Further filter to primary consumption meters
        primary = [p for p in (os_filtered if os_filtered else prices) if p.is_primary_meter]
        return primary if primary else (os_filtered if os_filtered else prices)

    def _price_container_registry(self, resource: ResourceInventory, enrichment: dict) -> List[NormalizedPrice]:
        """
        Container Registry: Use sku_name (Basic/Standard/Premium) to return
        the primary daily base registry unit meter + data storage meter.
        """
        registry_sku = enrichment.get("sku_name") or resource.sku_name or "Standard"

        statement = select(NormalizedPrice).where(
            col(NormalizedPrice.service_name).ilike("%Container Registry%"),
            NormalizedPrice.region == resource.location,
            col(NormalizedPrice.sku_name).ilike(f"%{registry_sku}%"),
        )
        prices = self._session.exec(statement).all()

        # Return primary base registry unit meter + data stored meter
        filtered = [
            p for p in prices
            if "registry unit" in p.meter_name.lower() or "data stored" in p.meter_name.lower()
        ]
        return filtered if filtered else prices

    # ------------------------------------------------------------------
    # Private Helper Methods
    # ------------------------------------------------------------------

    async def _fetch_retail_prices_http(
        self, odata_filter: str, currency: Optional[str] = "USD"
    ) -> list[dict]:
        """Execute HTTP GET requests against Azure Retail Prices API with pagination & retry."""
        close_client = False
        client = self._client
        if client is None:
            client = httpx.AsyncClient()
            close_client = True

        all_items: list[dict] = []
        url: Optional[str] = AZURE_PRICES_BASE_URL
        params: dict = {
            "$filter": odata_filter,
            "api-version": AZURE_API_VERSION,
        }
        if currency:
            params["currencyCode"] = currency

        page_count = 0
        try:
            while url and page_count < self.MAX_PAGES:
                page_count += 1
                for attempt in range(1, self.MAX_RETRIES + 1):
                    try:
                        response = await client.get(url, params=params, timeout=REQUEST_TIMEOUT_SECONDS)
                        response.raise_for_status()
                        data = response.json()

                        items = data.get("Items", [])
                        all_items.extend(items)

                        url = data.get("NextPageLink")
                        params = {}
                        break
                    except (httpx.TimeoutException, httpx.ConnectError, httpx.HTTPStatusError) as err:
                        if attempt < self.MAX_RETRIES:
                            wait = 2 ** (attempt - 1)
                            logger.warning("Retail Prices API attempt %d/%d failed: %s. Retrying in %ds...", attempt, self.MAX_RETRIES, err, wait)
                            await asyncio.sleep(wait)
                        else:
                            logger.error("Retail Prices API request failed after %d attempts: %s", self.MAX_RETRIES, err)
                            url = None
                            break
        finally:
            if close_client:
                await client.aclose()

        return all_items

    def _normalize_and_upsert(
        self, raw_items: list[dict], default_region: str = "eastus"
    ) -> List[NormalizedPrice]:
        """Parse raw Azure Retail Price API dicts, resolve primary meter ambiguity, and save to DB."""
        records: list[NormalizedPrice] = []
        now = datetime.now(timezone.utc)

        for item in raw_items:
            billing_term = item.get("reservationTerm") or item.get("type", "Consumption")
            price_type = item.get("type", "Consumption")
            is_primary = (price_type.lower() == "consumption")

            eff_date = None
            raw_date = item.get("effectiveStartDate")
            if raw_date:
                try:
                    eff_date = datetime.fromisoformat(raw_date.replace("Z", "+00:00"))
                except ValueError:
                    pass

            record = NormalizedPrice(
                product_name=item.get("productName", ""),
                sku_name=item.get("skuName", ""),
                meter_name=item.get("meterName", ""),
                service_name=item.get("serviceName", ""),
                region=item.get("armRegionName") or default_region,
                currency_code=item.get("currencyCode", "USD"),
                retail_price=float(item.get("retailPrice", 0.0)),
                unit_of_measure=item.get("unitOfMeasure", ""),
                billing_term=billing_term,
                price_type=price_type,
                effective_date=eff_date,
                is_primary_meter=is_primary,
                last_synced_at=now,
            )
            self._session.add(record)
            records.append(record)

        self._session.commit()
        for r in records:
            self._session.refresh(r)
        return records

    @staticmethod
    def _update_stage(stages_json: Optional[str], stage_name: str, status: str) -> str:
        """Update stage status inside JSON string."""
        import json
        stages = json.loads(stages_json) if stages_json else {}
        stages[stage_name] = status
        return json.dumps(stages)
