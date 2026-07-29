"""
Health monitoring endpoint.
"""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlmodel import Session, select, col

from src.core.dependencies import get_session
from src.models.price_cache import AzurePriceCache

router = APIRouter(tags=["Health"])
_last_sync_summary: dict = {}


def set_sync_summary(summary: dict) -> None:
    global _last_sync_summary
    _last_sync_summary = summary


@router.get("/health")
def health_check(session: Session = Depends(get_session)):
    """Return API status, cached SKU count, and cache staleness."""
    count = len(session.exec(select(AzurePriceCache)).all())
    oldest = session.exec(
        select(AzurePriceCache).order_by(col(AzurePriceCache.last_updated))
    ).first()

    oldest_age_hours = None
    if oldest and oldest.last_updated:
        last = oldest.last_updated
        if last.tzinfo is None:
            last = last.replace(tzinfo=timezone.utc)
        delta = datetime.now(timezone.utc) - last
        oldest_age_hours = round(delta.total_seconds() / 3600, 2)

    return {
        "status": "healthy" if count > 0 else "empty_cache",
        "cached_skus": count,
        "oldest_record_age_hours": oldest_age_hours,
        "last_sync_summary": _last_sync_summary,
    }
