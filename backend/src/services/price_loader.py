"""
PriceLoader — responsible for reading price data from the local DB cache.
"""

import logging
from typing import Optional
from sqlmodel import Session, select

from src.models.price_cache import AzurePriceCache
from src.services.sku_manifest import SKU_MANIFEST

logger = logging.getLogger(__name__)

# SKU keys for infrastructure services (non-model)
_INFRA_SKU_KEYS = ["ai-search-basic", "blob-storage-gb", "app-service-b1"]

# Maps model display name → its input/output SKU keys
MODEL_SKU_MAP: dict[str, dict[str, str]] = {
    mapping["model"]: {
        "input":  sku_key,
        "output": sku_key.replace("-input", "-output"),
    }
    for sku_key, mapping in SKU_MANIFEST.items()
    if "model" in mapping and mapping.get("direction") == "input"
}


class PriceLoader:
    """
    Loads retail prices from the local Azure price cache.

    Usage:
        loader = PriceLoader(session)
        prices = loader.load_all()
        input_price = loader.get("gpt-4o-input")
    """

    def __init__(self, session: Session) -> None:
        self._session = session

    def get(self, sku_key: str) -> Optional[float]:
        """Look up a single SKU price by key. Returns None if not cached."""
        statement = select(AzurePriceCache).where(AzurePriceCache.sku_key == sku_key)
        record = self._session.exec(statement).first()
        return record.retail_price if record else None

    def load_all(self) -> dict[str, Optional[float]]:
        """
        Bulk-load all prices needed for a full cost estimate:
        infrastructure SKUs + every model's input/output SKUs.
        """
        needed: list[str] = list(_INFRA_SKU_KEYS)
        for model_skus in MODEL_SKU_MAP.values():
            needed.extend([model_skus["input"], model_skus["output"]])

        return {key: self.get(key) for key in needed}
