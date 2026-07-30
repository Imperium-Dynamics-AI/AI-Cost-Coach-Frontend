"""
Pydantic schemas for request, response, and error payloads.
Matches docs/API_CONTRACT.md.
"""

from __future__ import annotations
from typing import Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class ResourcesInput(BaseModel):
    compute: bool = False


class ScenarioInput(BaseModel):
    id: str
    model: str
    forceRag: bool = False


class OpenAIInput(BaseModel):
    users: int = Field(default=500, ge=1, description="Number of active users")
    requestsPerDay: int = Field(default=5, ge=1, description="Messages per user per day")
    avgPromptTokens: int = Field(default=800, ge=0, description="Average prompt tokens")
    avgCompletionTokens: int = Field(default=400, ge=0, description="Average response tokens")


class RAGInput(BaseModel):
    avgDocTokens: int = Field(default=600, ge=0, description="Avg doc tokens injected into prompt")


class StorageInput(BaseModel):
    docStorageGB: float = Field(default=5, ge=0, description="Document storage in GB")


class GlobalInput(BaseModel):
    growthPct: float = Field(default=10, ge=0, description="Monthly growth percentage")


class CostEstimateRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    resources: ResourcesInput = Field(default_factory=ResourcesInput)
    scenarios: List[ScenarioInput]
    openai: OpenAIInput = Field(default_factory=OpenAIInput)
    rag: RAGInput = Field(default_factory=RAGInput)
    storage: StorageInput = Field(default_factory=StorageInput)
    global_settings: GlobalInput = Field(default_factory=GlobalInput, alias="global")


class ScenarioBreakdown(BaseModel):
    openai: Optional[float] = 0
    rag: Optional[float] = 0
    storage: Optional[float] = 0
    compute: Optional[float] = 0
    apim: Optional[float] = 0
    monitoring: Optional[float] = 0
    identity: Optional[float] = 0
    finetuning: Optional[float] = 0


class ScenarioResult(BaseModel):
    name: str
    breakdown: ScenarioBreakdown
    monthlyTotal: Optional[float] = None
    annualTotal: Optional[float] = None
    costPerUser: Optional[float] = None
    costPerConversation: Optional[float] = None
    nextMonthProjected: Optional[float] = None


class CostEstimateResponse(BaseModel):
    currency: str = "USD"
    totalMonthlyRequests: int
    cheapestId: Optional[str] = None
    warnings: List[str] = []
    scenarios: Dict[str, ScenarioResult]


class ErrorResponse(BaseModel):
    code: str
    message: str
    fieldErrors: Dict[str, str] = {}
