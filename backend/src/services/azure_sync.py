"""
Azure Retail Prices API integration & database upsert service.
"""

import asyncio
import logging
from datetime import datetime, timezone
import httpx
from sqlmodel import Session, select

from src.config.settings import AZURE_PRICES_BASE_URL, AZURE_API_VERSION, REQUEST_TIMEOUT_SECONDS
from src.core.database import engine
from src.models.price_cache import AzurePriceCache

logger = logging.getLogger(__name__)
MAX_RETRIES = 3


def _openai_sku(sku_name: str, model: str, direction: str) -> dict:
    return {
        "filter": (
            "productName eq 'Azure OpenAI' "
            f"and skuName eq '{sku_name}' "
            "and armRegionName eq 'eastus'"
        ),
        "model": model,
        "direction": direction,
    }


SKU_MANIFEST = {
    "gpt-4o-input": _openai_sku("gpt 4o 0513 Input regional", "GPT-4o", "input"),
    "gpt-4o-output": _openai_sku("gpt 4o 0513 Output regional", "GPT-4o", "output"),
    "gpt-4o-mini-input": _openai_sku("gpt-4o-mini-0718-Inp-regnl", "GPT-4o mini", "input"),
    "gpt-4o-mini-output": _openai_sku("gpt-4o-mini-0718-Outp-regnl", "GPT-4o mini", "output"),
    "gpt-4.1-input": _openai_sku("gpt 4.1 Inp regnl", "GPT-4.1", "input"),
    "gpt-4.1-output": _openai_sku("gpt 4.1 Outp regnl", "GPT-4.1", "output"),
    "gpt-4.1-mini-input": _openai_sku("gpt 4.1 mini Inp regnl", "GPT-4.1 mini", "input"),
    "gpt-4.1-mini-output": _openai_sku("gpt 4.1 mini Outp regnl", "GPT-4.1 mini", "output"),
    "gpt-4.1-nano-input": _openai_sku("gpt 4.1 nano Inp regnl", "GPT-4.1 nano", "input"),
    "gpt-4.1-nano-output": _openai_sku("gpt 4.1 nano Outp regnl", "GPT-4.1 nano", "output"),
    "gpt-4-turbo-input": _openai_sku("gpt-4-turbo-128K Input-regional", "GPT-4 Turbo", "input"),
    "gpt-4-turbo-output": _openai_sku("gpt-4-turbo-128K Output-regional", "GPT-4 Turbo", "output"),
    "gpt-3.5-turbo-input": _openai_sku("gpt-35-turbo-16K-0125 Input-regional", "GPT-3.5 Turbo", "input"),
    "gpt-3.5-turbo-output": _openai_sku("gpt-35-turbo-16K-0125 Output-regional", "GPT-3.5 Turbo", "output"),
    "o1-input": _openai_sku("o1 1217 Inp regnl", "o1", "input"),
    "o1-output": _openai_sku("o1 1217 Outp regnl", "o1", "output"),
    "o1-mini-input": _openai_sku("o1 mini input regnl", "o1 mini", "input"),
    "o1-mini-output": _openai_sku("o1 mini output regnl", "o1 mini", "output"),
    "o3-input": _openai_sku("o3 0416 Inp regnl", "o3", "input"),
    "o3-output": _openai_sku("o3 0416 Outp regnl", "o3", "output"),
    "o3-mini-input": _openai_sku("o3 mini 0131 input regnl", "o3 mini", "input"),
    "o3-mini-output": _openai_sku("o3 mini 0131 output regnl", "o3 mini", "output"),
    "o4-mini-input": _openai_sku("o4 mini Inp regnl", "o4-mini", "input"),
    "o4-mini-output": _openai_sku("o4 mini Outp regnl", "o4-mini", "output"),
    "ai-search-basic": {
        "filter": (
            "serviceName eq 'Azure Cognitive Search' "
            "and skuName eq 'Basic' "
            "and armRegionName eq 'eastus'"
        ),
    },
    "blob-storage-gb": {
        "filter": (
            "serviceName eq 'Storage' "
            "and skuName eq 'Hot LRS' "
            "and contains(meterName, 'Data Stored') "
            "and armRegionName eq 'eastus'"
        ),
    },
    "app-service-b1": {
        "filter": (
            "serviceName eq 'Azure App Service' "
            "and meterName eq 'B1' "
            "and armRegionName eq 'eastus'"
        ),
    },
}


def _upsert_price(session: Session, sku_key: str, azure_item: dict) -> None:
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


async def fetch_and_cache_azure_prices() -> dict:
    summary: dict[str, list[str]] = {"synced": [], "failed": [], "no_match": []}

    async with httpx.AsyncClient() as client:
        with Session(engine) as session:
            for sku_key, mapping in SKU_MANIFEST.items():
                try:
                    params = {
                        "$filter": mapping["filter"],
                        "api-version": AZURE_API_VERSION,
                    }
                    response = None
                    for attempt in range(1, MAX_RETRIES + 1):
                        try:
                            response = await client.get(
                                AZURE_PRICES_BASE_URL,
                                params=params,
                                timeout=REQUEST_TIMEOUT_SECONDS,
                            )
                            response.raise_for_status()
                            break
                        except (httpx.TimeoutException, httpx.ConnectError) as retry_err:
                            if attempt < MAX_RETRIES:
                                wait = 2 ** (attempt - 1)
                                logger.warning(
                                    "Attempt %d/%d for %s failed (%s), retrying in %ds...",
                                    attempt, MAX_RETRIES, sku_key, retry_err, wait,
                                )
                                await asyncio.sleep(wait)
                            else:
                                raise

                    items = response.json().get("Items", [])
                    if not items:
                        logger.warning("No Azure matches for SKU: %s", sku_key)
                        summary["no_match"].append(sku_key)
                        continue

                    _upsert_price(session, sku_key, items[0])
                    session.commit()
                    summary["synced"].append(sku_key)

                except Exception:
                    logger.exception("Failed to sync SKU: %s", sku_key)
                    summary["failed"].append(sku_key)

    return summary
