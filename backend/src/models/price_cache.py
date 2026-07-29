"""
SQLModel ORM definition for the cached Azure price records table.
"""

from datetime import datetime, timezone
from typing import Optional
from sqlmodel import Field, SQLModel


class AzurePriceCache(SQLModel, table=True):
    """Local SQLite table storing synced Azure retail pricing records."""

    sku_key: str = Field(primary_key=True, index=True)
    service_name: str
    product_name: str
    sku_name: str
    meter_name: str
    retail_price: float
    unit_of_measure: str
    currency_code: str = "USD"
    price_type: str = ""
    region: str = "eastus"
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
