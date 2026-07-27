"""
Pure calculation engine logic for computing cost estimates.
"""

import logging
from typing import Optional
from sqlmodel import Session, select

from src.models.price_cache import AzurePriceCache
from src.schemas.cost_estimate import (
    CostEstimateRequest,
    CostEstimateResponse,
    ScenarioBreakdown,
    ScenarioInput,
    ScenarioResult,
)

logger = logging.getLogger(__name__)

HOURS_PER_MONTH = 730
DAYS_PER_MONTH = 30

MODEL_SKU_MAP: dict[str, dict[str, str]] = {
    "GPT-4o": {"input": "gpt-4o-input", "output": "gpt-4o-output"},
    "GPT-4o mini": {"input": "gpt-4o-mini-input", "output": "gpt-4o-mini-output"},
    "GPT-4.1": {"input": "gpt-4.1-input", "output": "gpt-4.1-output"},
    "GPT-4.1 mini": {"input": "gpt-4.1-mini-input", "output": "gpt-4.1-mini-output"},
    "GPT-4.1 nano": {"input": "gpt-4.1-nano-input", "output": "gpt-4.1-nano-output"},
    "GPT-4 Turbo": {"input": "gpt-4-turbo-input", "output": "gpt-4-turbo-output"},
    "GPT-3.5 Turbo": {"input": "gpt-3.5-turbo-input", "output": "gpt-3.5-turbo-output"},
    "o1": {"input": "o1-input", "output": "o1-output"},
    "o1 mini": {"input": "o1-mini-input", "output": "o1-mini-output"},
    "o3": {"input": "o3-input", "output": "o3-output"},
    "o3 mini": {"input": "o3-mini-input", "output": "o3-mini-output"},
    "o4-mini": {"input": "o4-mini-input", "output": "o4-mini-output"},
}


def _get_cached_price(session: Session, sku_key: str) -> Optional[float]:
    statement = select(AzurePriceCache).where(AzurePriceCache.sku_key == sku_key)
    record = session.exec(statement).first()
    return record.retail_price if record else None


def _load_prices(session: Session) -> dict[str, Optional[float]]:
    needed = ["ai-search-basic", "blob-storage-gb", "app-service-b1"]
    for mapping in MODEL_SKU_MAP.values():
        needed.extend([mapping["input"], mapping["output"]])
    return {key: _get_cached_price(session, key) for key in needed}


def _calculate_scenario(
    scenario: ScenarioInput,
    request: CostEstimateRequest,
    prices: dict[str, Optional[float]],
    warnings: list[str],
) -> ScenarioResult:
    model = scenario.model
    rag_enabled = scenario.forceRag
    compute_enabled = request.resources.compute

    users = request.openai.users
    msgs_per_day = request.openai.requestsPerDay
    total_monthly_requests = users * msgs_per_day * DAYS_PER_MONTH
    growth_rate = request.global_settings.growthPct / 100

    sku_keys = MODEL_SKU_MAP.get(model)
    if sku_keys is None:
        warnings.append(f"Model '{model}' is not recognized. OpenAI cost cannot be calculated.")
        openai_cost = None
    else:
        in_rate = prices.get(sku_keys["input"])
        out_rate = prices.get(sku_keys["output"])
        if in_rate is None or out_rate is None:
            warnings.append(f"Model '{model}' is missing pricing data. OpenAI cost cannot be calculated.")
            openai_cost = None
        else:
            prompt_tokens = request.openai.avgPromptTokens
            if rag_enabled:
                prompt_tokens += request.rag.avgDocTokens
            completion_tokens = request.openai.avgCompletionTokens

            prompt_cost = (prompt_tokens * in_rate) / 1000.0
            completion_cost = (completion_tokens * out_rate) / 1000.0
            openai_cost = round(total_monthly_requests * (prompt_cost + completion_cost), 2)

    search_rate = prices.get("ai-search-basic")
    if rag_enabled:
        rag_cost = round(search_rate * HOURS_PER_MONTH, 2) if search_rate is not None else None
    else:
        rag_cost = 0.0

    blob_rate = prices.get("blob-storage-gb")
    if rag_enabled:
        storage_cost = round(request.storage.docStorageGB * blob_rate, 2) if blob_rate is not None else None
    else:
        storage_cost = 0.0

    app_rate = prices.get("app-service-b1")
    if compute_enabled:
        compute_cost = round(app_rate * HOURS_PER_MONTH, 2) if app_rate is not None else None
    else:
        compute_cost = 0.0

    cost_parts = [openai_cost, rag_cost, storage_cost, compute_cost]
    if any(c is None for c in cost_parts):
        monthly_total = None
        annual_total = None
        cost_per_user = None
        cost_per_conversation = None
        next_month_projected = None
    else:
        monthly_total = round(sum(c for c in cost_parts if c is not None), 2)
        annual_total = round(sum(monthly_total * ((1 + growth_rate) ** i) for i in range(12)), 2)
        cost_per_user = round(monthly_total / users, 4) if users > 0 else 0.0
        cost_per_conversation = round(monthly_total / total_monthly_requests, 4) if total_monthly_requests > 0 else 0.0
        next_month_projected = round(monthly_total * (1 + growth_rate), 2)

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
        nextMonthProjected=next_month_projected,
    )


def calculate_all_scenarios(request: CostEstimateRequest, session: Session) -> CostEstimateResponse:
    prices = _load_prices(session)
    warnings: list[str] = []
    scenarios_dict: dict[str, ScenarioResult] = {}

    for scenario_input in request.scenarios:
        res = _calculate_scenario(scenario_input, request, prices, warnings)
        scenarios_dict[scenario_input.id] = res

    cheapest_id = None
    min_cost = float("inf")
    for s_id, s_res in scenarios_dict.items():
        if s_res.monthlyTotal is not None and s_res.monthlyTotal < min_cost:
            min_cost = s_res.monthlyTotal
            cheapest_id = s_id

    total_requests = request.openai.users * request.openai.requestsPerDay * DAYS_PER_MONTH
    unique_warnings = list(dict.fromkeys(warnings))

    return CostEstimateResponse(
        totalMonthlyRequests=total_requests,
        cheapestId=cheapest_id,
        warnings=unique_warnings,
        scenarios=scenarios_dict,
    )
