import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select, col
from typing import List

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from config import REFRESH_INTERVAL_HOURS
from database import init_db, get_session, AzurePriceCache
from updater import fetch_and_cache_azure_prices

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Scheduler & state shared across the lifespan
# ---------------------------------------------------------------------------
scheduler = AsyncIOScheduler()
_last_sync_summary: dict = {}


async def _run_sync() -> None:
    """Wrapper so the scheduler can call the async updater and store results."""
    global _last_sync_summary
    _last_sync_summary = await fetch_and_cache_azure_prices()


# ---------------------------------------------------------------------------
# Lifespan (replaces deprecated @app.on_event)
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ───────────────────────────────────────────────────────────
    init_db()
    logger.info("Database initialized.")

    logger.info("Running initial price sync...")
    await _run_sync()
    logger.info("Initial sync complete: %s", _last_sync_summary)

    scheduler.add_job(
        _run_sync,
        "interval",
        hours=REFRESH_INTERVAL_HOURS,
        id="price_refresh",
    )
    scheduler.start()
    logger.info("Scheduler started — refreshing every %dh.", REFRESH_INTERVAL_HOURS)

    yield  # ← app is running

    # ── Shutdown ──────────────────────────────────────────────────────────
    scheduler.shutdown(wait=False)
    logger.info("Scheduler shut down.")


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Azure Pricing Cache API",
    version="2.0.0",
    description=(
        "Caches Azure retail prices locally and exposes them via REST "
        "endpoints for the AI Cost Coach frontend."
    ),
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.get("/health")
def health_check(session: Session = Depends(get_session)):
    """
    Returns API health, cache freshness, and last sync summary.
    Useful for monitoring and for the frontend to verify the API is alive.
    """
    count = len(session.exec(select(AzurePriceCache)).all())

    # Find the oldest record to report cache staleness
    oldest = session.exec(
        select(AzurePriceCache).order_by(col(AzurePriceCache.last_updated))
    ).first()

    oldest_age_hours = None
    if oldest and oldest.last_updated:
        # SQLite stores naive datetimes — treat them as UTC
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


@app.get("/prices", response_model=List[AzurePriceCache])
def get_all_prices(session: Session = Depends(get_session)):
    """Return every cached price record."""
    return session.exec(select(AzurePriceCache)).all()


@app.get("/prices/by-service/{service_name}", response_model=List[AzurePriceCache])
def get_prices_by_service(service_name: str, session: Session = Depends(get_session)):
    """
    Filter cached prices by service name (case-insensitive partial match).
    Example: /prices/by-service/openai → returns all Azure OpenAI SKUs.
    """
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


@app.get("/prices/{sku_key}", response_model=AzurePriceCache)
def get_price_by_sku(sku_key: str, session: Session = Depends(get_session)):
    """Look up a single cached price by its SKU key."""
    statement = select(AzurePriceCache).where(AzurePriceCache.sku_key == sku_key)
    record = session.exec(statement).first()
    if not record:
        raise HTTPException(
            status_code=404,
            detail=f"SKU key '{sku_key}' not found in cache.",
        )
    return record
