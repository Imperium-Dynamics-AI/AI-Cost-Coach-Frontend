"""
SQLModel ORM definition for Azure resource inventory records table.
"""

from datetime import datetime, timezone
import uuid
from typing import Optional
from sqlmodel import Field, SQLModel


class ResourceInventory(SQLModel, table=True):
    """Local database table storing discovered Azure resource inventory."""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True, index=True)
    scan_id: str = Field(index=True)
    azure_resource_id: str = Field(index=True)
    name: str
    resource_type: str = Field(index=True)
    subscription_id: str = Field(index=True)
    resource_group: str = Field(index=True)
    location: str
    sku_name: Optional[str] = None
    sku_tier: Optional[str] = None
    kind: Optional[str] = None
    tags: Optional[str] = None  # JSON string of tags
    provisioning_state: Optional[str] = None
    enrichment_data: Optional[str] = None  # JSON string of ARM enrichment details
    enriched_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
