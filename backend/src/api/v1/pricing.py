"""
Dynamic Generalized Pricing API endpoints.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, col

from src.core.dependencies import get_session
from src.models.pricing import NormalizedPrice
from src.models.resource import ResourceInventory
from src.schemas.pricing import PriceQueryRequest, PriceQueryResponse, PriceRecordResponse
from src.services.pricing_engine import PricingEngine

router = APIRouter(tags=["Generalized Pricing"])


@router.post("/api/v1/pricing/query", response_model=PriceQueryResponse)
async def query_pricing(
    request: PriceQueryRequest,
    session: Session = Depends(get_session),
):
    """
    Dynamically query Azure Retail Prices API for any product, SKU, region, currency,
    or billing term. Checks local cache first; if missing, fetches live from Azure API and caches.
    """
    engine = PricingEngine(session)
    records = await engine.query_prices(
        product_name=request.product_name,
        sku_name=request.sku_name,
        region=request.region,
        currency=request.currency,
        billing_term=request.billing_term,
    )

    primary_prices: list[PriceRecordResponse] = []
    ambiguous_prices: list[PriceRecordResponse] = []

    for r in records:
        resp = _to_price_response(r)
        if r.is_primary_meter:
            primary_prices.append(resp)
        else:
            ambiguous_prices.append(resp)

    return PriceQueryResponse(
        total_results=len(records),
        prices=primary_prices if primary_prices else ambiguous_prices,
        ambiguous_matches=ambiguous_prices if primary_prices else [],
    )


@router.get("/api/v1/pricing/for-resource/{resource_id:path}", response_model=List[PriceRecordResponse])
def get_pricing_for_resource(
    resource_id: str,
    session: Session = Depends(get_session),
):
    """Retrieve reference retail prices applicable to a specific discovered resource."""
    record = session.get(ResourceInventory, resource_id)
    if not record:
        record = session.exec(
            select(ResourceInventory).where(ResourceInventory.azure_resource_id == resource_id)
        ).first()

    if not record:
        raise HTTPException(
            status_code=404,
            detail=f"Discovered resource with ID '{resource_id}' not found.",
        )

    engine = PricingEngine(session)
    prices = engine.get_prices_for_resource(record)
    return [_to_price_response(p) for p in prices]


@router.get("/api/v1/pricing/regions", response_model=List[str])
def list_cached_pricing_regions(
    session: Session = Depends(get_session),
):
    """List all distinct Azure regions currently stored in the normalized price cache."""
    statement = select(NormalizedPrice.region).distinct()
    regions = session.exec(statement).all()
    return sorted(list(set(regions)))


# ---------------------------------------------------------------------------
# Serialization Helper
# ---------------------------------------------------------------------------

def _to_price_response(p: NormalizedPrice) -> PriceRecordResponse:
    return PriceRecordResponse(
        id=p.id,
        product_name=p.product_name,
        sku_name=p.sku_name,
        meter_name=p.meter_name,
        service_name=p.service_name,
        region=p.region,
        currency_code=p.currency_code,
        retail_price=p.retail_price,
        unit_of_measure=p.unit_of_measure,
        billing_term=p.billing_term,
        price_type=p.price_type,
        effective_date=p.effective_date,
        is_primary_meter=p.is_primary_meter,
        last_synced_at=p.last_synced_at,
    )
