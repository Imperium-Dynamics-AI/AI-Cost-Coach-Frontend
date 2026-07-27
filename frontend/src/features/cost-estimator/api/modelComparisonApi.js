const MODELS_PATH = "/api/v1/models";
const COMPARISONS_PATH =
  import.meta.env?.VITE_MODEL_COMPARISONS_PATH || "/api/v1/model-comparisons";
const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export const USING_PLACEHOLDER_API = import.meta.env?.VITE_USE_MOCK_API === "true";

const PLACEHOLDER_CATALOG = {
  region: "eastus",
  currency: "USD",
  placeholder: true,
  models: [
    {
      id: "gpt-4o",
      name: "GPT-4o",
      inputPer1K: 0.005,
      outputPer1K: 0.015,
    },
    {
      id: "gpt-4.1",
      name: "GPT-4.1",
      inputPer1K: 0.002,
      outputPer1K: 0.008,
    },
  ],
  infrastructure: {
    aiSearchBasicPerHour: 0.14,
    blobStoragePerGB: 0.02,
    appServiceB1PerHour: 0.075,
  },
};

function createPlaceholderEstimate(name) {
  return {
    name,
    breakdown: {
      openai: null,
      rag: null,
      storage: null,
      compute: null,
    },
    monthlyTotal: null,
    annualTotal: null,
    costPerUser: null,
    costPerConversation: null,
    nextMonthProjected: null,
  };
}

async function requestPlaceholderComparisons(payload) {
  await new Promise((resolve) => window.setTimeout(resolve, 350));

  const selectedModel = PLACEHOLDER_CATALOG.models.find(
    (model) => model.id === payload.selectedModelId,
  ) ?? {
    id: payload.selectedModelId,
    name: payload.selectedModelId,
  };
  const estimateName = payload.rag.enabled
    ? `${selectedModel.name} + your content`
    : selectedModel.name;

  return {
    currency: PLACEHOLDER_CATALOG.currency,
    totalMonthlyRequests: null,
    cheapestId: null,
    warnings: [],
    placeholder: true,
    comparisons: [
      {
        id: "selected",
        label: "Selected model",
        relationship: "selected",
        reason: "Preview mode returns the selected model until the comparison API is connected.",
        model: selectedModel,
        configuration: {
          ragEnabled: payload.rag.enabled,
          computeEnabled: payload.resources.compute,
        },
        estimate: createPlaceholderEstimate(estimateName),
      },
    ],
  };
}

async function readErrorMessage(response) {
  try {
    const body = await response.json();
    if (typeof body.message === "string" && body.message) {
      return body.message;
    }
    if (typeof body.detail === "string" && body.detail) {
      return body.detail;
    }
    return `The comparison service returned ${response.status}.`;
  } catch {
    return `The comparison service returned ${response.status}.`;
  }
}

function normalizePrice(value) {
  return value === null || value === undefined || !Number.isFinite(Number(value))
    ? null
    : Number(value);
}

function normalizeModelCatalog(result) {
  if (!Array.isArray(result?.models) || !result?.infrastructure) {
    throw new Error("The model pricing service returned an unexpected response.");
  }

  return {
    region: result.region || "",
    currency: result.currency || "USD",
    placeholder: Boolean(result.placeholder),
    models: result.models
      .filter(
        (model) =>
          typeof model?.id === "string" &&
          model.id.trim() &&
          typeof model?.name === "string" &&
          model.name.trim(),
      )
      .map((model) => ({
        id: model.id,
        name: model.name,
        inputPer1K: normalizePrice(model.inputPer1K),
        outputPer1K: normalizePrice(model.outputPer1K),
      })),
    infrastructure: {
      aiSearchBasicPerHour: normalizePrice(
        result.infrastructure.aiSearchBasicPerHour,
      ),
      blobStoragePerGB: normalizePrice(result.infrastructure.blobStoragePerGB),
      appServiceB1PerHour: normalizePrice(
        result.infrastructure.appServiceB1PerHour,
      ),
    },
  };
}

function normalizeComparisonResponse(result) {
  if (!Array.isArray(result?.comparisons) || result.comparisons.length === 0) {
    throw new Error("The comparison service returned an unexpected response.");
  }

  const comparisons = result.comparisons.map((comparison) => {
    if (
      typeof comparison?.id !== "string" ||
      !comparison.id.trim() ||
      typeof comparison?.label !== "string" ||
      !comparison.label.trim() ||
      typeof comparison?.relationship !== "string" ||
      !comparison.relationship.trim() ||
      typeof comparison?.reason !== "string" ||
      !comparison.reason.trim() ||
      typeof comparison?.model?.id !== "string" ||
      !comparison.model.id.trim() ||
      typeof comparison?.model?.name !== "string" ||
      !comparison.model.name.trim() ||
      !comparison?.estimate ||
      typeof comparison?.configuration?.ragEnabled !== "boolean" ||
      typeof comparison?.configuration?.computeEnabled !== "boolean"
    ) {
      throw new Error("The comparison service returned an unexpected response.");
    }

    return {
      ...comparison,
    };
  });

  const comparisonIds = new Set(comparisons.map((comparison) => comparison.id));
  if (comparisonIds.size !== comparisons.length) {
    throw new Error("The comparison service returned duplicate comparison IDs.");
  }
  if (result.cheapestId != null && !comparisonIds.has(result.cheapestId)) {
    throw new Error("The comparison service returned an unknown cheapest comparison.");
  }

  return {
    ...result,
    currency: result.currency || "USD",
    warnings: Array.isArray(result.warnings) ? result.warnings : [],
    comparisons,
  };
}

export async function requestModelCatalog() {
  if (USING_PLACEHOLDER_API) {
    return normalizeModelCatalog(PLACEHOLDER_CATALOG);
  }

  const response = await fetch(`${API_BASE_URL}${MODELS_PATH}`);

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return normalizeModelCatalog(await response.json());
}

export async function requestModelComparisons(payload) {
  if (USING_PLACEHOLDER_API) {
    return requestPlaceholderComparisons(payload);
  }

  const response = await fetch(`${API_BASE_URL}${COMPARISONS_PATH}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return normalizeComparisonResponse(await response.json());
}
