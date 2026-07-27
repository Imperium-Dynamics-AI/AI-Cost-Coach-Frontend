"""
Cost calculation engine for the AI Cost Coach.

Takes user inputs + cached Azure prices and runs every scenario through a
single, identical formula.  No special-casing — 500 users and 1,000,000
users execute the same code path.
"""

from __future__ import annotations

import logging
from typing import Optional

from sqlmodel import Session, select

from database import AzurePriceCache
from schemas import (
    CostEstimateRequest,
    CostEstimateResponse,
    ScenarioBreakdown,
    ScenarioInput,
    ScenarioResult,
)

logger = logging.getLogger(__name__)

# ─── Constants ────────────────────────────────────────────────────────────────

HOURS_PER_MONTH = 730
DAYS_PER_MONTH = 30

# Maps frontend model display names → cached SKU key pairs in our database.
# To support a new model, add its SKU filters in updater.py and a mapping here.
MODEL_SKU_MAP: dict[str, dict[str, str]] = {
    "GPT-4o":        {"input": "gpt-4o-input",        "output": "gpt-4o-output"},
    "GPT-4o mini":   {"input": "gpt-4o-mini-input",   "output": "gpt-4o-mini-output"},
    "GPT-4.1":       {"input": "gpt-4.1-input",       "output": "gpt-4.1-output"},
    "GPT-4.1 mini":  {"input": "gpt-4.1-mini-input",  "output": "gpt-4.1-mini-output"},
    "GPT-4.1 nano":  {"input": "gpt-4.1-nano-input",  "output": "gpt-4.1-nano-output"},
    "GPT-4 Turbo":   {"input": "gpt-4-turbo-input",   "output": "gpt-4-turbo-output"},
    "GPT-3.5 Turbo": {"input": "gpt-3.5-turbo-input", "output": "gpt-3.5-turbo-output"},
    "o1":            {"input": "o1-input",             "output": "o1-output"},
    "o1 mini":       {"input": "o1-mini-input",        "output": "o1-mini-output"},
    "o3":            {"input": "o3-input",             "output": "o3-output"},
    "o3 mini":       {"input": "o3-mini-input",        "output": "o3-mini-output"},
    "o4-mini":       {"input": "o4-mini-input",        "output": "o4-mini-output"},
}


# ─── Helpers ──────────────────────────────────────────────────────────────────


def _get_cached_price(session: Session, sku_key: str) -> Optional[float]:
    """Look up a single retail price from the local SQLite cache."""
    record = session.exec(
        select(AzurePriceCache).where(AzurePriceCache.sku_key == sku_key)
    ).first()
    return record.retail_price if record else None


def _load_prices(session: Session) -> dict[str, Optional[float]]:
    """Load every price we need into a fast lookup dict."""
    needed = [
        "gpt-4o-input",
        "gpt-4o-output",
        "gpt-4.1-input",
        "gpt-4.1-output",
        "ai-search-basic",
        "blob-storage-gb",
        "app-service-b1",
    ]
    return {key: _get_cached_price(session, key) for key in needed}


# ─── Single-scenario calculator ──────────────────────────────────────────────


def _calculate_scenario(
    scenario: ScenarioInput,
    request: CostEstimateRequest,
    prices: dict[str, Optional[float]],
    warnings: list[str],
) -> ScenarioResult:
    """
    Run the cost formula for one scenario.

    token_cost    = users × msgs/day × 30 × (prompt × in_rate + response × out_rate) / 1000
    search_cost   = forceRag ? search_rate × 730 : 0
    storage_cost  = forceRag ? docStorageGB × blob_rate : 0
    app_cost      = compute ? app_rate × 730 : 0
    monthly_total = token_cost + search_cost + storage_cost + app_cost
    """
    model = scenario.model
    rag_enabled = scenario.forceRag
    compute_enabled = request.resources.compute

    users = request.openai.users
    msgs_per_day = request.openai.requestsPerDay
    total_monthly_requests = users * msgs_per_day * DAYS_PER_MONTH
    growth_rate = request.global_settings.growthPct / 100

    # ── 1. Token cost ─────────────────────────────────────────────────────
    sku_keys = MODEL_SKU_MAP.get(model)

    if sku_keys is None:
        warnings.append(
            f"Model '{model}' is not available in our pricing cache. "
            f"OpenAI cost cannot be calculated for scenario {scenario.id}."
        )
        openai_cost = None
    else:
        input_rate = prices.get(sku_keys["input"])
        output_rate = prices.get(sku_keys["output"])

        if input_rate is None or output_rate is None:
            warnings.append(
                f"Cached price missing for model '{model}'. "
                f"OpenAI cost cannot be calculated for scenario {scenario.id}."
            )
            openai_cost = None
        else:
            prompt_tokens = request.openai.avgPromptTokens
            if rag_enabled:
                # RAG injects retrieved document context into the prompt
                prompt_tokens += request.rag.avgDocTokens

            openai_cost = (
                total_monthly_requests
                * (prompt_tokens * input_rate + request.openai.avgCompletionTokens * output_rate)
                / 1000
            )

    # ── 2. AI Search cost ─────────────────────────────────────────────────
    if rag_enabled:
        search_rate = prices.get("ai-search-basic")
        if search_rate is not None:
            rag_cost = search_rate * HOURS_PER_MONTH
        else:
            warnings.append("AI Search price not cached. RAG cost cannot be calculated.")
            rag_cost = None
    else:
        rag_cost = 0.0

    # ── 3. Storage cost ───────────────────────────────────────────────────
    if rag_enabled:
        blob_rate = prices.get("blob-storage-gb")
        if blob_rate is not None:
            storage_cost = request.storage.docStorageGB * blob_rate
        else:
            warnings.append("Blob storage price not cached. Storage cost cannot be calculated.")
            storage_cost = None
    else:
        storage_cost = 0.0

    # ── 4. App Service cost ───────────────────────────────────────────────
    if compute_enabled:
        app_rate = prices.get("app-service-b1")
        if app_rate is not None:
            compute_cost = app_rate * HOURS_PER_MONTH
        else:
            warnings.append("App Service price not cached. Compute cost cannot be calculated.")
            compute_cost = None
    else:
        compute_cost = 0.0

    # ── 5. Totals & derived metrics ───────────────────────────────────────
    cost_parts = [openai_cost, rag_cost, storage_cost, compute_cost]

    if any(c is None for c in cost_parts):
        # At least one component could not be priced
        monthly_total = None
        annual_total = None
        cost_per_user = None
        cost_per_conversation = None
        next_month_projected = None
    else:
        monthly_total = round(sum(cost_parts), 2)

        # Annual with compound monthly growth
        annual_total = round(
            sum(monthly_total * (1 + growth_rate) ** i for i in range(12)),
            2,
        )

        cost_per_user = round(monthly_total / users, 4)

        cost_per_conversation = (
            round(monthly_total / total_monthly_requests, 4)
            if total_monthly_requests > 0
            else 0.0
        )

        next_month_projected = round(monthly_total * (1 + growth_rate), 2)

    # ── Build scenario name ───────────────────────────────────────────────
    name = f"{model} + RAG" if rag_enabled else model

    return ScenarioResult(
        name=name,
        breakdown=ScenarioBreakdown(
            openai=round(openai_cost, 2) if openai_cost is not None else None,
            rag=round(rag_cost, 2) if rag_cost is not None else None,
            storage=round(storage_cost, 2) if storage_cost is not None else None,
            compute=round(compute_cost, 2) if compute_cost is not None else None,
            apim=0,
            monitoring=0,
            identity=0,
            finetuning=0,
        ),
        monthlyTotal=monthly_total,
        annualTotal=annual_total,
        costPerUser=cost_per_user,
        costPerConversation=cost_per_conversation,
        nextMonthProjected=next_month_projected,
    )


# ─── Multi-scenario orchestrator ─────────────────────────────────────────────


def calculate_all_scenarios(
    request: CostEstimateRequest,
    session: Session,
) -> CostEstimateResponse:
    """
    Calculate costs for every requested scenario, determine the cheapest,
    and assemble the full API response.
    """
    prices = _load_prices(session)
    warnings: list[str] = []

    total_monthly_requests = (
        request.openai.users * request.openai.requestsPerDay * DAYS_PER_MONTH
    )

    # Run each scenario through the identical formula
    scenarios: dict[str, ScenarioResult] = {}
    for scenario in request.scenarios:
        result = _calculate_scenario(scenario, request, prices, warnings)
        scenarios[scenario.id] = result

    # Determine cheapest scenario
    cheapest_id = None
    cheapest_cost: Optional[float] = None
    for sid, result in scenarios.items():
        if result.monthlyTotal is not None:
            if cheapest_cost is None or result.monthlyTotal < cheapest_cost:
                cheapest_cost = result.monthlyTotal
                cheapest_id = sid

    return CostEstimateResponse(
        currency="USD",
        totalMonthlyRequests=total_monthly_requests,
        cheapestId=cheapest_id,
        warnings=list(set(warnings)),  # deduplicate
        scenarios=scenarios,
    )
