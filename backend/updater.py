import asyncio
import logging
import httpx
from datetime import datetime, timezone
from sqlmodel import Session, select

from config import AZURE_PRICES_BASE_URL, AZURE_API_VERSION, REQUEST_TIMEOUT_SECONDS
from database import engine, AzurePriceCache

logger = logging.getLogger(__name__)

MAX_RETRIES = 3

# ---------------------------------------------------------------------------
# SKU Manifest
# ---------------------------------------------------------------------------
# Each entry maps a human-readable key to an Azure Retail Prices API filter.
# To add a new SKU in the future, just add an entry here — the sync loop
# picks it up automatically.
# ---------------------------------------------------------------------------
SKU_MANIFEST = {
    # ── GPT-4o (Scenario A & C) ──────────────────────────────────────────
    "gpt-4o-input": {
        "filter": (
            "productName eq 'Azure OpenAI' "
            "and contains(skuName, 'gpt 4o') "
            "and contains(skuName, 'Input') "
            "and armRegionName eq 'eastus'"
        ),
    },
    "gpt-4o-output": {
        "filter": (
            "productName eq 'Azure OpenAI' "
            "and contains(skuName, 'gpt 4o') "
            "and contains(skuName, 'Output') "
            "and armRegionName eq 'eastus'"
        ),
    },

    # ── GPT-4.1 (Scenario B) ─────────────────────────────────────────────
    "gpt-4.1-input": {
        "filter": (
            "productName eq 'Azure OpenAI' "
            "and contains(skuName, 'gpt 4.1') "
            "and contains(skuName, 'Inp') "
            "and armRegionName eq 'eastus'"
        ),
    },
    "gpt-4.1-output": {
        "filter": (
            "productName eq 'Azure OpenAI' "
            "and contains(skuName, 'gpt 4.1') "
            "and contains(skuName, 'Out') "
            "and armRegionName eq 'eastus'"
        ),
    },

    # ── Azure AI Search — Basic tier (Scenario C: RAG) ───────────────────
    "ai-search-basic": {
        "filter": (
            "serviceName eq 'Azure Cognitive Search' "
            "and skuName eq 'Basic' "
            "and armRegionName eq 'eastus'"
        ),
    },

    # ── Blob Storage — Hot LRS per-GB (document storage) ─────────────────
    "blob-storage-gb": {
        "filter": (
            "serviceName eq 'Storage' "
            "and skuName eq 'Hot LRS' "
            "and contains(meterName, 'Data Stored') "
            "and armRegionName eq 'eastus'"
        ),
    },

    # ── App Service — B1 Linux (hosting) ─────────────────────────────────
    "app-service-b1": {
        "filter": (
            "serviceName eq 'Azure App Service' "
            "and meterName eq 'B1' "
            "and armRegionName eq 'eastus'"
        ),
    },
}


async def fetch_and_cache_azure_prices() -> dict:
    """
    Query the Azure Retail Prices API for every SKU in the manifest and
    upsert results into the local SQLite cache.

    Returns a summary dict: {"synced": [...], "failed": [...], "no_match": [...]}
    """
    summary: dict[str, list[str]] = {"synced": [], "failed": [], "no_match": []}

    async with httpx.AsyncClient() as client:
        with Session(engine) as session:
            for sku_key, mapping in SKU_MANIFEST.items():
                try:
                    params = {
                        "$filter": mapping["filter"],
                        "api-version": AZURE_API_VERSION,
                    }

                    # Retry with exponential backoff for transient failures
                    response = None
                    for attempt in range(1, MAX_RETRIES + 1):
                        try:
                            response = await client.get(
                                AZURE_PRICES_BASE_URL,
                                params=params,
                                timeout=REQUEST_TIMEOUT_SECONDS,
                            )
                            response.raise_for_status()
                            break  # success
                        except (httpx.TimeoutException, httpx.ConnectError) as retry_err:
                            if attempt < MAX_RETRIES:
                                wait = 2 ** (attempt - 1)  # 1s, 2s, 4s
                                logger.warning(
                                    "Attempt %d/%d for %s failed (%s), retrying in %ds...",
                                    attempt, MAX_RETRIES, sku_key, retry_err, wait,
                                )
                                await asyncio.sleep(wait)
                            else:
                                raise  # exhaust retries → fall through to outer except

                    items = response.json().get("Items", [])
                    if not items:
                        logger.warning("No Azure matches for SKU: %s", sku_key)
                        summary["no_match"].append(sku_key)
                        continue

                    azure_item = items[0]
                    _upsert_price(session, sku_key, azure_item)
                    session.commit()

                    logger.info(
                        "Synced SKU: %s → $%s / %s",
                        sku_key,
                        azure_item["retailPrice"],
                        azure_item["unitOfMeasure"],
                    )
                    summary["synced"].append(sku_key)

                except Exception:
                    logger.exception("Failed to sync SKU: %s", sku_key)
                    summary["failed"].append(sku_key)

    return summary


def _upsert_price(session: Session, sku_key: str, azure_item: dict) -> None:
    """Insert or update a single price record."""
    statement = select(AzurePriceCache).where(AzurePriceCache.sku_key == sku_key)
    record = session.exec(statement).first()

    fields = {
        "service_name": azure_item.get("serviceName", ""),
        "product_name": azure_item.get("productName", ""),
        "sku_name": azure_item.get("skuName", ""),
        "meter_name": azure_item.get("meterName", ""),
        "retail_price": azure_item["retailPrice"],
        "unit_of_measure": azure_item["unitOfMeasure"],
        "currency_code": azure_item.get("currencyCode", "USD"),
        "price_type": azure_item.get("type", ""),
        "region": azure_item.get("armRegionName", "eastus"),
        "last_updated": datetime.now(timezone.utc),
    }

    if record:
        for key, value in fields.items():
            setattr(record, key, value)
    else:
        record = AzurePriceCache(sku_key=sku_key, **fields)

    session.add(record)
