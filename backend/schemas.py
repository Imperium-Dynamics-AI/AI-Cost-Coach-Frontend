"""
Pydantic models defining the request and response JSON structures
for the POST /api/v1/cost-estimates endpoint.

Matches the contract in docs/API_CONTRACT.md.
"""

from __future__ import annotations

from typing import Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field


# ═══════════════════════════════════════════════════════════════════════════════
# Request Models
# ═══════════════════════════════════════════════════════════════════════════════


class ResourcesInput(BaseModel):
    """Toggle for optional resource categories."""

    compute: bool = False


class ScenarioInput(BaseModel):
    """One of the three comparison scenarios (A, B, or C)."""

    id: str
    model: str
    forceRag: bool = False


class OpenAIInput(BaseModel):
    """Core usage assumptions collected from the form."""

    users: int = Field(default=500, ge=1, description="Number of active users")
    requestsPerDay: int = Field(default=5, ge=1, description="Messages per user per day")
    avgPromptTokens: int = Field(default=800, ge=0, description="Average prompt tokens")
    avgCompletionTokens: int = Field(default=400, ge=0, description="Average response tokens")


class RAGInput(BaseModel):
    """RAG-specific inputs — only relevant when a scenario has forceRag enabled."""

    avgDocTokens: int = Field(default=600, ge=0, description="Avg tokens per doc chunk injected into prompt")


class StorageInput(BaseModel):
    """Document storage assumptions for the RAG scenario."""

    docStorageGB: float = Field(default=5, ge=0, description="Total document storage in GB")


class GlobalInput(BaseModel):
    """Growth projection settings."""

    growthPct: float = Field(default=10, ge=0, description="Monthly growth percentage")


class CostEstimateRequest(BaseModel):
    """
    The request body sent by the frontend.

    Contains only the fields actively consumed by the calculation engine.
    """

    model_config = ConfigDict(populate_by_name=True)

    resources: ResourcesInput = Field(default_factory=ResourcesInput)
    scenarios: List[ScenarioInput]
    openai: OpenAIInput = Field(default_factory=OpenAIInput)
    rag: RAGInput = Field(default_factory=RAGInput)
    storage: StorageInput = Field(default_factory=StorageInput)
    global_settings: GlobalInput = Field(default_factory=GlobalInput, alias="global")


# ═══════════════════════════════════════════════════════════════════════════════
# Response Models
# ═══════════════════════════════════════════════════════════════════════════════


class ScenarioBreakdown(BaseModel):
    """Cost breakdown by resource category for one scenario."""

    openai: Optional[float] = 0
    rag: Optional[float] = 0
    storage: Optional[float] = 0
    compute: Optional[float] = 0
    apim: Optional[float] = 0
    monitoring: Optional[float] = 0
    identity: Optional[float] = 0
    finetuning: Optional[float] = 0


class ScenarioResult(BaseModel):
    """Complete result for a single scenario (A, B, or C)."""

    name: str
    breakdown: ScenarioBreakdown
    monthlyTotal: Optional[float] = None
    annualTotal: Optional[float] = None
    costPerUser: Optional[float] = None
    costPerConversation: Optional[float] = None
    nextMonthProjected: Optional[float] = None


class CostEstimateResponse(BaseModel):
    """The full response returned by POST /api/v1/cost-estimates."""

    currency: str = "USD"
    totalMonthlyRequests: int
    cheapestId: Optional[str] = None
    warnings: List[str] = []
    scenarios: Dict[str, ScenarioResult]


# ═══════════════════════════════════════════════════════════════════════════════
# Error Response
# ═══════════════════════════════════════════════════════════════════════════════


class ErrorResponse(BaseModel):
    """Stable error shape matching docs/API_CONTRACT.md."""

    code: str
    message: str
    fieldErrors: Dict[str, str] = {}
