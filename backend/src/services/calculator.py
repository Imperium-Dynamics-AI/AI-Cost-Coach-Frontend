"""
CostEstimateOrchestrator — coordinates PriceLoader and ScenarioCalculator
to produce a full CostEstimateResponse.
"""

import logging
from sqlmodel import Session

from src.schemas.cost_estimate import CostEstimateRequest, CostEstimateResponse, ScenarioResult
from src.services.constants import DAYS_PER_MONTH
from src.services.price_loader import PriceLoader
from src.services.scenario_calculator import ScenarioCalculator

logger = logging.getLogger(__name__)


class CostEstimateOrchestrator:
    """
    Top-level coordinator for cost estimation.

    Usage:
        orchestrator = CostEstimateOrchestrator(session)
        response = orchestrator.run(request)
    """

    def __init__(self, session: Session) -> None:
        self._session = session

    def run(self, request: CostEstimateRequest) -> CostEstimateResponse:
        """Run cost estimation across all scenarios and return the full response."""
        prices = PriceLoader(self._session).load_all()
        calculator = ScenarioCalculator(request, prices)

        warnings: list[str] = []
        scenarios: dict[str, ScenarioResult] = {}

        for scenario_input in request.scenarios:
            scenarios[scenario_input.id] = calculator.calculate(scenario_input, warnings)

        cheapest_id = self._find_cheapest(scenarios)
        total_requests = (
            request.openai.users * request.openai.requestsPerDay * DAYS_PER_MONTH
        )

        return CostEstimateResponse(
            totalMonthlyRequests=total_requests,
            cheapestId=cheapest_id,
            warnings=list(dict.fromkeys(warnings)),  # deduplicate, preserve order
            scenarios=scenarios,
        )

    # ------------------------------------------------------------------
    # Private
    # ------------------------------------------------------------------

    @staticmethod
    def _find_cheapest(scenarios: dict[str, ScenarioResult]) -> str | None:
        """Return the scenario ID with the lowest monthly total, or None."""
        cheapest_id = None
        min_cost = float("inf")
        for s_id, result in scenarios.items():
            if result.monthlyTotal is not None and result.monthlyTotal < min_cost:
                min_cost = result.monthlyTotal
                cheapest_id = s_id
        return cheapest_id


# ---------------------------------------------------------------------------
# Backward-compatibility shim — keeps the existing API router unchanged
# ---------------------------------------------------------------------------

def calculate_all_scenarios(
    request: CostEstimateRequest, session: Session
) -> CostEstimateResponse:
    """Thin wrapper around CostEstimateOrchestrator for backward compatibility."""
    return CostEstimateOrchestrator(session).run(request)
