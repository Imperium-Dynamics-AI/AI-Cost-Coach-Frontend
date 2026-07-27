"""
AzurePriceSyncer — fetches prices from the Azure Retail Prices API and upserts them
into the local database cache.
"""

import asyncio
import logging
from datetime import datetime, timezone

import httpx
from sqlmodel import Session, select

from src.config.settings import AZURE_PRICES_BASE_URL, AZURE_API_VERSION, REQUEST_TIMEOUT_SECONDS
from src.core.database import engine
from src.models.price_cache import AzurePriceCache
from src.services.sku_manifest import SKU_MANIFEST

logger = logging.getLogger(__name__)


class AzurePriceSyncer:
    """
    Syncs Azure retail prices for all SKUs defined in SKU_MANIFEST into the local DB.

    Usage:
        async with httpx.AsyncClient() as client:
            with Session(engine) as session:
                syncer = AzurePriceSyncer(session, client)
                summary = await syncer.sync_all()
    """

    MAX_RETRIES = 3

    def __init__(self, session: Session, client: httpx.AsyncClient) -> None:
        self._session = session
        self._client = client

    # ------------------------------------------------------------------
    # Public
    # ------------------------------------------------------------------

    async def sync_all(self) -> dict[str, list[str]]:
        """
        Iterate through every SKU in the manifest, fetch its price, and upsert to DB.
        Returns a summary dict with keys: 'synced', 'failed', 'no_match'.
        """
        summary: dict[str, list[str]] = {"synced": [], "failed": [], "no_match": []}

        for sku_key, mapping in SKU_MANIFEST.items():
            try:
                item = await self._fetch_sku(sku_key, mapping)
                if item is None:
                    summary["no_match"].append(sku_key)
                    continue
                self._upsert(sku_key, item)
                self._session.commit()
                summary["synced"].append(sku_key)
            except Exception:
                logger.exception("Failed to sync SKU: %s", sku_key)
                summary["failed"].append(sku_key)

        return summary

    # ------------------------------------------------------------------
    # Private
    # ------------------------------------------------------------------

    async def _fetch_sku(self, sku_key: str, mapping: dict) -> dict | None:
        """
        Fetch a single SKU from the Azure Retail Prices API with exponential-backoff retry.
        Returns the first matching item dict, or None if no results.
        """
        params = {
            "$filter": mapping["filter"],
            "api-version": AZURE_API_VERSION,
        }

        for attempt in range(1, self.MAX_RETRIES + 1):
            try:
                response = await self._client.get(
                    AZURE_PRICES_BASE_URL,
                    params=params,
                    timeout=REQUEST_TIMEOUT_SECONDS,
                )
                response.raise_for_status()
                items = response.json().get("Items", [])
                if not items:
                    logger.warning("No Azure matches for SKU: %s", sku_key)
                    return None
                return items[0]

            except (httpx.TimeoutException, httpx.ConnectError) as err:
                if attempt < self.MAX_RETRIES:
                    wait = 2 ** (attempt - 1)
                    logger.warning(
                        "Attempt %d/%d for %s failed (%s), retrying in %ds...",
                        attempt, self.MAX_RETRIES, sku_key, err, wait,
                    )
                    await asyncio.sleep(wait)
                else:
                    raise

    def _upsert(self, sku_key: str, azure_item: dict) -> None:
        """Insert or update a price record in the local cache table."""
        statement = select(AzurePriceCache).where(AzurePriceCache.sku_key == sku_key)
        record = self._session.exec(statement).first()

        fields = {
            "service_name":   azure_item.get("serviceName", ""),
            "product_name":   azure_item.get("productName", ""),
            "sku_name":       azure_item.get("skuName", ""),
            "meter_name":     azure_item.get("meterName", ""),
            "retail_price":   azure_item["retailPrice"],
            "unit_of_measure":azure_item["unitOfMeasure"],
            "currency_code":  azure_item.get("currencyCode", "USD"),
            "price_type":     azure_item.get("type", ""),
            "region":         azure_item.get("armRegionName", "eastus"),
            "last_updated":   datetime.now(timezone.utc),
        }

        if record:
            for key, value in fields.items():
                setattr(record, key, value)
        else:
            record = AzurePriceCache(sku_key=sku_key, **fields)

        self._session.add(record)


# ---------------------------------------------------------------------------
# Backward-compatibility shim — keeps main.py unchanged
# ---------------------------------------------------------------------------

async def fetch_and_cache_azure_prices() -> dict:
    """Thin wrapper around AzurePriceSyncer for backward compatibility."""
    async with httpx.AsyncClient() as client:
        with Session(engine) as session:
            syncer = AzurePriceSyncer(session, client)
            return await syncer.sync_all()
