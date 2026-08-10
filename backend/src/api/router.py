"""
Main API router aggregating all v1 endpoint sub-routers.
"""

from fastapi import APIRouter
from src.api.v1.health import router as health_router
from src.api.v1.prices import router as prices_router
from src.api.v1.models import router as models_router
from src.api.v1.estimates import router as estimates_router
from src.api.v1.inventory import router as inventory_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(prices_router)
api_router.include_router(models_router)
api_router.include_router(estimates_router)
api_router.include_router(inventory_router)

