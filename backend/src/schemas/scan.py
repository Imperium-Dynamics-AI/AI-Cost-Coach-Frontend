"""
Pydantic schemas for scan management endpoints.
"""

from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class StartScanRequest(BaseModel):
    subscription_ids: Optional[List[str]] = Field(
        default=None,
        description="List of Azure subscription GUIDs to scan. If omitted, default subscription from .env is used.",
    )


class ScanStatusResponse(BaseModel):
    id: str
    subscription_ids: List[str]
    status: str  # pending, discovering, enriching, completed, partial, failed
    total_resources: int
    resources_enriched: int
    resource_types_found: List[str] = []
    stages: Dict[str, str] = {}
    errors: List[str] = []
    started_at: datetime
    completed_at: Optional[datetime] = None
    duration_seconds: Optional[float] = None


class ScanListResponse(BaseModel):
    total_scans: int
    scans: List[ScanStatusResponse]
