"""
ScenarioCalculator — responsible for computing the cost breakdown for a single scenario.
"""

import logging
from typing import Optional

from src.schemas.cost_estimate import (
    CostEstimateRequest,
    ScenarioBreakdown,
    ScenarioInput,
    ScenarioResult,
)
from src.services.constants import HOURS_PER_MONTH, DAYS_PER_MONTH
from src.services.price_loader import MODEL_SKU_MAP

logger = logging.getLogger(__name__)


class ScenarioCalculator:
    """
    Calculates a full cost breakdown for one scenario against a pre-loaded price map.

    Usage:
        calc = ScenarioCalculator(request, prices)
        result = calc.calculate(scenario_input, warnings)
    """

    def __init__(
        self,
        request: CostEstimateRequest,
        prices: dict[str, Optional[float]],
    ) -> None:
        self._request = request
        self._prices = prices

        # Pre-compute shared request-level values
        self._users = request.openai.users
        self._msgs_per_day = request.openai.requestsPerDay
        self._total_monthly_requests = self._users * self._msgs_per_day * DAYS_PER_MONTH
        self._growth_rate = request.global_settings.growthPct / 100

    # ------------------------------------------------------------------
    # Public
    # ------------------------------------------------------------------

    def calculate(self, scenario: ScenarioInput, warnings: list[str]) -> ScenarioResult:
        """Compute full cost breakdown for a single scenario. Mutates `warnings`."""
        model = scenario.model
        rag_enabled = scenario.forceRag
        compute_enabled = self._request.resources.compute

        openai_cost = self._openai_cost(model, rag_enabled, warnings)
        rag_cost = self._rag_cost(rag_enabled)
        storage_cost = self._storage_cost(rag_enabled)
        compute_cost = self._compute_cost(compute_enabled)

        monthly_total, annual_total, cost_per_user, cost_per_conversation, next_month = (
            self._totals(openai_cost, rag_cost, storage_cost, compute_cost)
        )

        breakdown = ScenarioBreakdown(
            openai=openai_cost,
            rag=rag_cost,
            storage=storage_cost,
            compute=compute_cost,
        )
        name = f"{model} + your content" if rag_enabled else model
        return ScenarioResult(
            name=name,
            breakdown=breakdown,
            monthlyTotal=monthly_total,
            annualTotal=annual_total,
            costPerUser=cost_per_user,
            costPerConversation=cost_per_conversation,
            nextMonthProjected=next_month,
        )

    # ------------------------------------------------------------------
    # Private helpers — one method per cost component
    # ------------------------------------------------------------------

    def _openai_cost(
        self, model: str, rag_enabled: bool, warnings: list[str]
    ) -> Optional[float]:
        """Calculate OpenAI token cost for this model/scenario."""
        sku_keys = MODEL_SKU_MAP.get(model)
        if sku_keys is None:
            warnings.append(
                f"Model '{model}' is not recognized. OpenAI cost cannot be calculated."
            )
            return None

        in_rate = self._prices.get(sku_keys["input"])
        out_rate = self._prices.get(sku_keys["output"])
        if in_rate is None or out_rate is None:
            warnings.append(
                f"Model '{model}' is missing pricing data. OpenAI cost cannot be calculated."
            )
            return None

        prompt_tokens = self._request.openai.avgPromptTokens
        if rag_enabled:
            prompt_tokens += self._request.rag.avgDocTokens
        completion_tokens = self._request.openai.avgCompletionTokens

        prompt_cost = (prompt_tokens * in_rate) / 1000.0
        completion_cost = (completion_tokens * out_rate) / 1000.0
        return round(self._total_monthly_requests * (prompt_cost + completion_cost), 2)

    def _rag_cost(self, rag_enabled: bool) -> Optional[float]:
        """Calculate Azure AI Search cost. Returns 0 if RAG is disabled."""
        if not rag_enabled:
            return 0.0
        rate = self._prices.get("ai-search-basic")
        return round(rate * HOURS_PER_MONTH, 2) if rate is not None else None

    def _storage_cost(self, rag_enabled: bool) -> Optional[float]:
        """Calculate Blob Storage cost. Returns 0 if RAG is disabled."""
        if not rag_enabled:
            return 0.0
        rate = self._prices.get("blob-storage-gb")
        return (
            round(self._request.storage.docStorageGB * rate, 2)
            if rate is not None
            else None
        )

    def _compute_cost(self, compute_enabled: bool) -> Optional[float]:
        """Calculate App Service compute cost. Returns 0 if compute is disabled."""
        if not compute_enabled:
            return 0.0
        rate = self._prices.get("app-service-b1")
        return round(rate * HOURS_PER_MONTH, 2) if rate is not None else None

    def _totals(
        self,
        openai_cost: Optional[float],
        rag_cost: Optional[float],
        storage_cost: Optional[float],
        compute_cost: Optional[float],
    ) -> tuple[
        Optional[float],  # monthly_total
        Optional[float],  # annual_total
        Optional[float],  # cost_per_user
        Optional[float],  # cost_per_conversation
        Optional[float],  # next_month_projected
    ]:
        """Aggregate all cost components into summary metrics."""
        cost_parts = [openai_cost, rag_cost, storage_cost, compute_cost]
        if any(c is None for c in cost_parts):
            return None, None, None, None, None

        monthly_total = round(sum(cost_parts), 2)  # type: ignore[arg-type]
        annual_total = round(
            sum(monthly_total * ((1 + self._growth_rate) ** i) for i in range(12)), 2
        )
        cost_per_user = (
            round(monthly_total / self._users, 4) if self._users > 0 else 0.0
        )
        cost_per_conversation = (
            round(monthly_total / self._total_monthly_requests, 4)
            if self._total_monthly_requests > 0
            else 0.0
        )
        next_month = round(monthly_total * (1 + self._growth_rate), 2)

        return monthly_total, annual_total, cost_per_user, cost_per_conversation, next_month
