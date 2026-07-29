"""
Cost estimation endpoint (kept for backward compatibility & frontend reference).
"""

from fastapi import APIRouter, Depends
from sqlmodel import Session

from src.core.dependencies import get_session
from src.schemas.cost_estimate import CostEstimateRequest, CostEstimateResponse
from src.services.calculator import calculate_all_scenarios

router = APIRouter(tags=["Estimates"])


@router.post("/api/v1/cost-estimates", response_model=CostEstimateResponse)
def cost_estimate(
    request: CostEstimateRequest,
    session: Session = Depends(get_session),
):
    """Calculate monthly/annual cost estimates for AI deployments on Azure."""
    return calculate_all_scenarios(request, session)
