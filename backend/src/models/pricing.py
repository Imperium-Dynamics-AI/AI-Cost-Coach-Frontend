"""
SQLModel ORM definition for normalized Azure retail pricing table.
"""

from datetime import datetime, timezone
import uuid
from typing import Optional
from sqlmodel import Field, SQLModel


class NormalizedPrice(SQLModel, table=True):
    """Local database table storing generalized Azure retail price records."""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True, index=True)
    product_name: str = Field(index=True)
    sku_name: str = Field(index=True)
    meter_name: str = Field(index=True)
    service_name: str = Field(index=True)
    region: str = Field(default="eastus", index=True)
    currency_code: str = "USD"
    retail_price: float
    unit_of_measure: str
    billing_term: Optional[str] = None  # e.g., "Consumption", "1 Year Reserved"
    price_type: str = "Consumption"
    effective_date: Optional[datetime] = None
    is_primary_meter: bool = True
    last_synced_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
