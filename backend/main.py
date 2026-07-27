import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlmodel import Session, select, col
from typing import List

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from config import REFRESH_INTERVAL_HOURS
from database import init_db, get_session, AzurePriceCache
from updater import fetch_and_cache_azure_prices
from schemas import CostEstimateRequest, CostEstimateResponse
from calculator import calculate_all_scenarios

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
# Custom validation error handler (matches docs/API_CONTRACT.md error shape)
# ---------------------------------------------------------------------------
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Convert Pydantic validation errors into the stable API contract error format."""
    field_errors = {}
    for error in exc.errors():
        # Build dotted field path, skipping the leading "body" segment
        field_path = ".".join(
            str(loc) for loc in error["loc"] if loc != "body"
        )
        field_errors[field_path] = error["msg"]

    return JSONResponse(
        status_code=422,
        content={
            "code": "INVALID_ESTIMATE_INPUT",
            "message": "One or more assumptions are invalid.",
            "fieldErrors": field_errors,
        },
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


# ---------------------------------------------------------------------------
# Cost Estimation (kept for backward compatibility / frontend reference)
# ---------------------------------------------------------------------------
@app.post("/api/v1/cost-estimates", response_model=CostEstimateResponse)
def cost_estimate(
    request: CostEstimateRequest,
    session: Session = Depends(get_session),
):
    """
    Calculate monthly/annual cost estimates for AI deployments on Azure.

    Accepts form inputs (users, tokens, RAG, etc.), runs each scenario
    through the pricing formula using real cached Azure prices, and
    returns a side-by-side comparison of Scenarios A, B, and C.
    """
    return calculate_all_scenarios(request, session)


# ---------------------------------------------------------------------------
# Model Pricing (primary endpoint for frontend cost calculations)
# ---------------------------------------------------------------------------
@app.get("/api/v1/models")
def get_models(session: Session = Depends(get_session)):
    """
    Return all available OpenAI models with their input/output token prices,
    plus infrastructure rates for AI Search, Blob Storage, and App Service.

    The frontend fetches this once, caches locally, and uses the prices
    to calculate costs client-side for instant, dynamic pricing.
    """
    from updater import SKU_MANIFEST

    # ── Build model price pairs from cached database ──────────────────────
    # Group SKU manifest entries by model name using metadata tags
    model_prices: dict[str, dict] = {}
    for sku_key, mapping in SKU_MANIFEST.items():
        model_name = mapping.get("model")
        direction = mapping.get("direction")
        if not model_name or not direction:
            continue  # Skip infrastructure SKUs (no model/direction tags)

        if model_name not in model_prices:
            model_prices[model_name] = {
                "id": sku_key.rsplit("-", 1)[0],  # e.g. "gpt-4o-input" → "gpt-4o"
                "name": model_name,
                "inputPer1K": None,
                "outputPer1K": None,
            }

        # Look up the cached price from SQLite
        record = session.exec(
            select(AzurePriceCache).where(AzurePriceCache.sku_key == sku_key)
        ).first()

        price = record.retail_price if record else None

        if direction == "input":
            model_prices[model_name]["inputPer1K"] = price
        elif direction == "output":
            model_prices[model_name]["outputPer1K"] = price

    # ── Collect infrastructure prices ─────────────────────────────────────
    def _get_price(sku_key: str):
        rec = session.exec(
            select(AzurePriceCache).where(AzurePriceCache.sku_key == sku_key)
        ).first()
        return rec.retail_price if rec else None

    # ── Filter out models where both prices are missing ───────────────────
    available_models = [
        m for m in model_prices.values()
        if m["inputPer1K"] is not None or m["outputPer1K"] is not None
    ]

    return {
        "region": "eastus",
        "currency": "USD",
        "models": available_models,
        "infrastructure": {
            "aiSearchBasicPerHour": _get_price("ai-search-basic"),
            "blobStoragePerGB": _get_price("blob-storage-gb"),
            "appServiceB1PerHour": _get_price("app-service-b1"),
        },
    }
