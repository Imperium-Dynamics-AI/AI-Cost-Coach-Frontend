"""
FastAPI application entrypoint.
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from src.config.settings import REFRESH_INTERVAL_HOURS
from src.core.database import init_db
from src.core.exceptions import validation_exception_handler
from src.services.azure_sync import fetch_and_cache_azure_prices
from src.api.v1.health import set_sync_summary
from src.api.router import api_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s")
logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler()


async def _run_sync() -> None:
    summary = await fetch_and_cache_azure_prices()
    set_sync_summary(summary)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    logger.info("Database initialized.")
    await _run_sync()
    scheduler.add_job(_run_sync, "interval", hours=REFRESH_INTERVAL_HOURS, id="price_refresh")
    scheduler.start()
    logger.info("Scheduler started — refreshing every %dh.", REFRESH_INTERVAL_HOURS)
    yield
    scheduler.shutdown(wait=False)


app = FastAPI(title="Azure Pricing Cache API", version="2.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.include_router(api_router)


@app.get("/")
def root():
    """Root endpoint welcoming users and directing them to interactive API docs."""
    return {
        "message": "Azure AI Cost Coach API v2.0 is running!",
        "documentation": "http://127.0.0.1:8000/docs",
        "health_check": "http://127.0.0.1:8000/health",
        "inventory": "http://127.0.0.1:8000/api/v1/inventory",
        "inventory_summary": "http://127.0.0.1:8000/api/v1/inventory/summary",
    }

