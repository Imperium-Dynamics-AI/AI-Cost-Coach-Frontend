"""
OpenAI model catalog & pricing endpoint for frontend client-side calculation.
"""

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from src.core.dependencies import get_session
from src.models.price_cache import AzurePriceCache
from src.services.azure_sync import SKU_MANIFEST

router = APIRouter(tags=["Models"])


@router.get("/api/v1/models")
def get_models(session: Session = Depends(get_session)):
    """
    Return all available OpenAI models with input/output token prices,
    plus infrastructure rates for AI Search, Blob Storage, and App Service.
    """
    model_prices: dict[str, dict] = {}
    for sku_key, mapping in SKU_MANIFEST.items():
        model_name = mapping.get("model")
        direction = mapping.get("direction")
        if not model_name or not direction:
            continue

        if model_name not in model_prices:
            model_prices[model_name] = {
                "id": sku_key.rsplit("-", 1)[0],
                "name": model_name,
                "inputPer1K": None,
                "outputPer1K": None,
            }

        record = session.exec(
            select(AzurePriceCache).where(AzurePriceCache.sku_key == sku_key)
        ).first()

        price = record.retail_price if record else None
        if direction == "input":
            model_prices[model_name]["inputPer1K"] = price
        elif direction == "output":
            model_prices[model_name]["outputPer1K"] = price

    def _get_price(sku_key: str):
        rec = session.exec(
            select(AzurePriceCache).where(AzurePriceCache.sku_key == sku_key)
        ).first()
        return rec.retail_price if rec else None

    available_models = [
        m for m in model_prices.values()
        if m["inputPer1K"] is not None or m["outputPer1K"] is not None
    ]

    return {
        "region": "eastus",
        "currency": "USD",
        "models": available_models,
        "infrastructure": {
            "aiSearchBasicPerHour": _get_price("ai-search-basic"),
            "blobStoragePerGB": _get_price("blob-storage-gb"),
            "appServiceB1PerHour": _get_price("app-service-b1"),
        },
    }
