"""
SQLModel ORM definition for Azure scan snapshot tracking table.
"""

from datetime import datetime, timezone
import uuid
from typing import Optional
from sqlmodel import Field, SQLModel


class ScanSnapshot(SQLModel, table=True):
    """Local database table storing scan status, progress, and metadata."""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True, index=True)
    subscription_ids: str  # JSON array of subscription IDs scanned
    status: str = Field(default="pending", index=True)  # pending, discovering, enriching, completed, partial, failed
    total_resources: int = 0
    resources_enriched: int = 0
    resource_types_found: Optional[str] = None  # JSON array of distinct resource types found
    stages: Optional[str] = None  # JSON object tracking stage progress
    errors: Optional[str] = None  # JSON array of error messages
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None
    duration_seconds: Optional[float] = None
