"""
Pydantic schemas for inventory endpoints.
"""

from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class ResourceResponse(BaseModel):
    id: str
    scan_id: str
    azure_resource_id: str
    name: str
    resource_type: str
    subscription_id: str
    resource_group: str
    location: str
    sku_name: Optional[str] = None
    sku_tier: Optional[str] = None
    kind: Optional[str] = None
    tags: Optional[Dict[str, str]] = None
    provisioning_state: Optional[str] = None
    enrichment_data: Optional[Dict] = None
    enriched_at: Optional[datetime] = None
    created_at: datetime


class InventoryListResponse(BaseModel):
    scan_id: Optional[str] = None
    total_resources: int
    resources: List[ResourceResponse]
    filters_applied: Dict[str, str] = {}


class ResourceTypeSummary(BaseModel):
    resource_type: str
    count: int
    enriched_count: int


class InventorySummaryResponse(BaseModel):
    total_resources: int
    total_scans: int
    by_type: List[ResourceTypeSummary]
    by_location: Dict[str, int]
    by_subscription: Dict[str, int]
