"""
Raw price lookup endpoints.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, col

from src.core.dependencies import get_session
from src.models.price_cache import AzurePriceCache

router = APIRouter(tags=["Prices"])


@router.get("/prices", response_model=List[AzurePriceCache])
def get_all_prices(session: Session = Depends(get_session)):
    """Return all cached price records."""
    return session.exec(select(AzurePriceCache)).all()


@router.get("/prices/by-service/{service_name}", response_model=List[AzurePriceCache])
def get_prices_by_service(service_name: str, session: Session = Depends(get_session)):
    """Filter cached prices by service name."""
    statement = select(AzurePriceCache).where(
        col(AzurePriceCache.service_name).ilike(f"%{service_name}%")
    )
    results = session.exec(statement).all()
    if not results:
        raise HTTPException(
            status_code=404,
            detail=f"No cached prices matching service '{service_name}'.",
        )
    return results


@router.get("/prices/{sku_key}", response_model=AzurePriceCache)
def get_price_by_sku(sku_key: str, session: Session = Depends(get_session)):
    """Look up a single cached price by SKU key."""
    statement = select(AzurePriceCache).where(AzurePriceCache.sku_key == sku_key)
    record = session.exec(statement).first()
    if not record:
        raise HTTPException(
            status_code=404,
            detail=f"SKU key '{sku_key}' not found in cache.",
        )
    return record
