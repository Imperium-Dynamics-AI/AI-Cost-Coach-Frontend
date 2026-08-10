"""
Inventory & Scan Management API endpoints.
"""

import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, col, func

from src.core.dependencies import get_session
from src.models.resource import ResourceInventory
from src.models.scan import ScanSnapshot
from src.schemas.inventory import (
    InventoryListResponse,
    InventorySummaryResponse,
    ResourceResponse,
    ResourceTypeSummary,
)
from src.schemas.scan import ScanListResponse, ScanStatusResponse, StartScanRequest
from src.services.resource_graph import AzureResourceGraphService

router = APIRouter(tags=["Inventory & Scans"])


# ---------------------------------------------------------------------------
# Scan Management Endpoints
# ---------------------------------------------------------------------------

@router.post("/api/v1/scans", response_model=ScanStatusResponse, status_code=202)
async def start_scan(
    request: Optional[StartScanRequest] = None,
    session: Session = Depends(get_session),
):
    """
    Trigger a manual read-only scan across selected Azure subscriptions.
    If subscription_ids is empty or omitted, defaults to AZURE_DEFAULT_SUBSCRIPTIONS in .env.
    """
    sub_ids = request.subscription_ids if request else None
    service = AzureResourceGraphService(session)
    scan = await service.run_scan(subscription_ids=sub_ids)
    return _to_scan_response(scan)


@router.get("/api/v1/scans/{scan_id}", response_model=ScanStatusResponse)
def get_scan_status(
    scan_id: str,
    session: Session = Depends(get_session),
):
    """Retrieve status, duration, stage progress, and errors for a specific scan."""
    scan = session.get(ScanSnapshot, scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail=f"Scan ID '{scan_id}' not found.")
    return _to_scan_response(scan)


@router.get("/api/v1/scans", response_model=ScanListResponse)
def list_scans(
    session: Session = Depends(get_session),
):
    """List history of all recorded Azure inventory scans."""
    scans = session.exec(select(ScanSnapshot).order_by(col(ScanSnapshot.started_at).desc())).all()
    return ScanListResponse(
        total_scans=len(scans),
        scans=[_to_scan_response(s) for s in scans],
    )


# ---------------------------------------------------------------------------
# Inventory Endpoints
# ---------------------------------------------------------------------------

@router.get("/api/v1/inventory", response_model=InventoryListResponse)
def list_inventory(
    scan_id: Optional[str] = Query(None, description="Filter resources by specific scan ID"),
    subscription_id: Optional[str] = Query(None, description="Filter by Azure subscription ID"),
    resource_group: Optional[str] = Query(None, description="Filter by resource group name"),
    resource_type: Optional[str] = Query(None, description="Filter by Azure resource type (e.g. Microsoft.Web/sites)"),
    location: Optional[str] = Query(None, description="Filter by region location (e.g. eastus)"),
    session: Session = Depends(get_session),
):
    """
    List discovered Azure resources with optional filters.
    If no scan_id is supplied, defaults to resources from the most recent completed scan.
    """
    statement = select(ResourceInventory)

    # Determine default scan_id if not provided
    target_scan_id = scan_id
    if not target_scan_id:
        latest_scan = session.exec(
            select(ScanSnapshot)
            .where(ScanSnapshot.status.in_(["completed", "partial"]))
            .order_by(col(ScanSnapshot.started_at).desc())
        ).first()
        if latest_scan:
            target_scan_id = latest_scan.id

    if target_scan_id:
        statement = statement.where(ResourceInventory.scan_id == target_scan_id)

    filters_applied: dict[str, str] = {}
    if subscription_id:
        statement = statement.where(ResourceInventory.subscription_id == subscription_id)
        filters_applied["subscription_id"] = subscription_id
    if resource_group:
        statement = statement.where(col(ResourceInventory.resource_group).ilike(f"%{resource_group}%"))
        filters_applied["resource_group"] = resource_group
    if resource_type:
        statement = statement.where(col(ResourceInventory.resource_type).ilike(f"%{resource_type}%"))
        filters_applied["resource_type"] = resource_type
    if location:
        statement = statement.where(ResourceInventory.location == location)
        filters_applied["location"] = location

    results = session.exec(statement).all()
    return InventoryListResponse(
        scan_id=target_scan_id,
        total_resources=len(results),
        resources=[_to_resource_response(r) for r in results],
        filters_applied=filters_applied,
    )


@router.get("/api/v1/inventory/summary", response_model=InventorySummaryResponse)
def get_inventory_summary(
    session: Session = Depends(get_session),
):
    """Return aggregated inventory metrics grouped by resource type, region, and subscription."""
    latest_scan = session.exec(
        select(ScanSnapshot)
        .where(ScanSnapshot.status.in_(["completed", "partial"]))
        .order_by(col(ScanSnapshot.started_at).desc())
    ).first()

    if not latest_scan:
        return InventorySummaryResponse(
            total_resources=0,
            total_scans=0,
            by_type=[],
            by_location={},
            by_subscription={},
        )

    resources = session.exec(
        select(ResourceInventory).where(ResourceInventory.scan_id == latest_scan.id)
    ).all()

    total_scans = len(session.exec(select(ScanSnapshot)).all())

    # Aggregate by type
    type_counts: dict[str, dict] = {}
    location_counts: dict[str, int] = {}
    subscription_counts: dict[str, int] = {}

    for r in resources:
        # Type
        if r.resource_type not in type_counts:
            type_counts[r.resource_type] = {"total": 0, "enriched": 0}
        type_counts[r.resource_type]["total"] += 1
        if r.enrichment_data:
            type_counts[r.resource_type]["enriched"] += 1

        # Location
        location_counts[r.location] = location_counts.get(r.location, 0) + 1

        # Subscription
        subscription_counts[r.subscription_id] = subscription_counts.get(r.subscription_id, 0) + 1

    by_type = [
        ResourceTypeSummary(
            resource_type=r_type,
            count=stats["total"],
            enriched_count=stats["enriched"],
        )
        for r_type, stats in sorted(type_counts.items(), key=lambda x: x[1]["total"], reverse=True)
    ]

    return InventorySummaryResponse(
        total_resources=len(resources),
        total_scans=total_scans,
        by_type=by_type,
        by_location=location_counts,
        by_subscription=subscription_counts,
    )


@router.get("/api/v1/inventory/{resource_id:path}", response_model=ResourceResponse)
def get_resource_detail(
    resource_id: str,
    session: Session = Depends(get_session),
):
    """Lookup a single discovered resource by database ID or Azure resource ID."""
    record = session.get(ResourceInventory, resource_id)
    if not record:
        record = session.exec(
            select(ResourceInventory).where(ResourceInventory.azure_resource_id == resource_id)
        ).first()

    if not record:
        raise HTTPException(
            status_code=404,
            detail=f"Resource with ID '{resource_id}' not found.",
        )
    return _to_resource_response(record)


# ---------------------------------------------------------------------------
# Serialization Helpers
# ---------------------------------------------------------------------------

def _to_scan_response(scan: ScanSnapshot) -> ScanStatusResponse:
    sub_ids = json.loads(scan.subscription_ids) if scan.subscription_ids else []
    types_found = json.loads(scan.resource_types_found) if scan.resource_types_found else []
    stages = json.loads(scan.stages) if scan.stages else {}
    errors = json.loads(scan.errors) if scan.errors else []

    return ScanStatusResponse(
        id=scan.id,
        subscription_ids=sub_ids,
        status=scan.status,
        total_resources=scan.total_resources,
        resources_enriched=scan.resources_enriched,
        resource_types_found=types_found,
        stages=stages,
        errors=errors,
        started_at=scan.started_at,
        completed_at=scan.completed_at,
        duration_seconds=scan.duration_seconds,
    )


def _to_resource_response(r: ResourceInventory) -> ResourceResponse:
    tags_dict = json.loads(r.tags) if r.tags else None
    enrichment_dict = json.loads(r.enrichment_data) if r.enrichment_data else None

    return ResourceResponse(
        id=r.id,
        scan_id=r.scan_id,
        azure_resource_id=r.azure_resource_id,
        name=r.name,
        resource_type=r.resource_type,
        subscription_id=r.subscription_id,
        resource_group=r.resource_group,
        location=r.location,
        sku_name=r.sku_name,
        sku_tier=r.sku_tier,
        kind=r.kind,
        tags=tags_dict,
        provisioning_state=r.provisioning_state,
        enrichment_data=enrichment_dict,
        enriched_at=r.enriched_at,
        created_at=r.created_at,
    )
