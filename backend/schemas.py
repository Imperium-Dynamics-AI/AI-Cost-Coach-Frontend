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
    """Boolean toggles indicating which resource sections the user enabled."""

    openai: bool = True
    rag: bool = True
    storage: bool = False
    compute: bool = False
    apim: bool = False
    monitoring: bool = False
    identity: bool = False
    finetuning: bool = False


class ScenarioInput(BaseModel):
    """One of the three comparison scenarios (A, B, or C)."""

    id: str
    model: str
    forceRag: bool = False


class PTUInput(BaseModel):
    count: int = 15
    commitment: str = "annual"
    scope: str = "global"


class BatchInput(BaseModel):
    percentEligible: float = 30


class OpenAIInput(BaseModel):
    """Core usage assumptions collected from the form."""

    model: str = "GPT-4o"
    billingMode: str = "payg"
    regionType: str = "global"
    users: int = Field(default=500, ge=1, description="Number of active users")
    requestsPerDay: int = Field(default=5, ge=1, description="Messages per user per day")
    avgPromptTokens: int = Field(default=800, ge=0, description="Average prompt tokens")
    avgCompletionTokens: int = Field(default=400, ge=0, description="Average response tokens")
    historyTurns: int = 1
    systemOverheadTokens: int = 300
    maxTokensCap: int = 0
    ptu: Optional[PTUInput] = None
    batch: Optional[BatchInput] = None


class RAGInput(BaseModel):
    """RAG-specific inputs — only relevant when RAG is enabled."""

    embeddingModel: str = "small"
    numDocuments: int = 2000
    avgDocTokens: int = Field(default=600, ge=0, description="Avg tokens per doc chunk injected into prompt")
    chunkSize: int = 300
    reindexFreq: str = "onetime"
    vectorQueriesPerDay: int = 200
    searchTier: str = "basic"
    replicaCount: int = 1


class StorageInput(BaseModel):
    """Storage assumptions for document and vector data."""

    docStorageGB: float = Field(default=5, ge=0)
    storageGrowthPct: float = 5
    vectorStorageGB: float = 2
    sqlTier: str = "standard"


class EnvironmentsInput(BaseModel):
    dev: bool = True
    test: bool = False
    prod: bool = True


class ComputeInput(BaseModel):
    appServiceTier: str = "basic"
    functionsPlan: str = "consumption"
    environments: Optional[EnvironmentsInput] = None


class APIMInput(BaseModel):
    apimTier: str = "developer"


class MonitoringInput(BaseModel):
    logGB: float = 10
    retentionDays: int = 30


class IdentityInput(BaseModel):
    entraTier: str = "free"
    licensedUsers: int = 500
    keyVaultIncluded: bool = True


class FinetuningInput(BaseModel):
    hostingOn: bool = False
    trainingCost: float = 0


class GlobalInput(BaseModel):
    """Planning buffer values — growth and overhead."""

    retryOverheadPct: float = 10
    growthPct: float = Field(default=10, ge=0, description="Monthly growth percentage")
    infraOverheadUsd: float = 40


class CostEstimateRequest(BaseModel):
    """
    The full request body sent by the frontend.

    All sections are accepted to stay compatible with the API contract.
    The MVP calculation engine uses: resources, scenarios, openai, rag,
    storage, compute, and global.
    """

    model_config = ConfigDict(populate_by_name=True)

    resources: ResourcesInput = Field(default_factory=ResourcesInput)
    scenarios: List[ScenarioInput]
    openai: OpenAIInput = Field(default_factory=OpenAIInput)
    rag: RAGInput = Field(default_factory=RAGInput)
    storage: StorageInput = Field(default_factory=StorageInput)
    compute: ComputeInput = Field(default_factory=ComputeInput)
    apim: Optional[APIMInput] = None
    monitoring: Optional[MonitoringInput] = None
    identity: Optional[IdentityInput] = None
    finetuning: Optional[FinetuningInput] = None
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
