"""
Pydantic schemas for dynamic pricing endpoints.
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class PriceQueryRequest(BaseModel):
    product_name: Optional[str] = Field(default=None, description="e.g. 'Azure OpenAI', 'Blob Storage'")
    service_name: Optional[str] = Field(default=None, description="e.g. 'Azure App Service', 'Storage'")
    sku_name: Optional[str] = Field(default=None, description="e.g. 'B1', 'Hot LRS'")
    meter_name: Optional[str] = Field(default=None, description="e.g. 'B1', 'Hot LRS Data Stored'")
    region: Optional[str] = Field(default="eastus", description="ARM region name")
    currency: Optional[str] = Field(default="USD", description="Currency code")
    billing_term: Optional[str] = Field(default=None, description="e.g. 'Consumption', '1 Year Reserved'")


class PriceRecordResponse(BaseModel):
    id: str
    product_name: str
    sku_name: str
    meter_name: str
    service_name: str
    region: str
    currency_code: str
    retail_price: float
    unit_of_measure: str
    billing_term: Optional[str] = None
    price_type: str
    effective_date: Optional[datetime] = None
    is_primary_meter: bool
    last_synced_at: datetime


class PriceQueryResponse(BaseModel):
    total_results: int
    prices: List[PriceRecordResponse]
    ambiguous_matches: List[PriceRecordResponse] = []
