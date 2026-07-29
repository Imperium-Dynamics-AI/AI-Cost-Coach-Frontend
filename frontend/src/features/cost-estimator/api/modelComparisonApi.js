const MODELS_PATH = "/api/v1/models";
// Comparisons are built client-side (see pickComparisonModels.js) and priced
// through the existing /api/v1/cost-estimates endpoint.
const ESTIMATES_PATH = "/api/v1/cost-estimates";
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

async function requestPlaceholderComparisons({ meta, costEstimateRequest }) {
  await new Promise((resolve) => window.setTimeout(resolve, 350));

  return {
    currency: PLACEHOLDER_CATALOG.currency,
    totalMonthlyRequests: null,
    cheapestId: null,
    warnings: [],
    placeholder: true,
    comparisons: meta.map((item) => {
      const ragEnabled =
        costEstimateRequest.scenarios.find((scenario) => scenario.id === item.id)
          ?.forceRag ?? false;

      return {
        id: item.id,
        label: item.label,
        relationship: item.relationship,
        reason: "Preview mode — connect the pricing service for real numbers.",
        model: { id: item.modelId, name: item.modelName },
        configuration: {
          ragEnabled,
          computeEnabled: costEstimateRequest.resources.compute,
        },
        estimate: createPlaceholderEstimate(
          ragEnabled ? `${item.modelName} + your content` : item.modelName,
        ),
      };
    }),
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
    if (Array.isArray(body.detail)) {
      const validationMessages = body.detail
        .map((detail) => detail?.msg)
        .filter((message) => typeof message === "string" && message);
      if (validationMessages.length) {
        return validationMessages.join(" ");
      }
    }
    return `The pricing service returned ${response.status}.`;
  } catch {
    return `The pricing service returned ${response.status}.`;
  }
}

function alignMetadataWithBackendTotals(item, scenario, baselineScenario) {
  if (item.relationship === "selected") {
    return item;
  }

  const monthlyTotal = scenario?.monthlyTotal;
  const baselineTotal = baselineScenario?.monthlyTotal;
  if (!Number.isFinite(monthlyTotal) || !Number.isFinite(baselineTotal)) {
    return item;
  }

  const difference = monthlyTotal - baselineTotal;
  if (Math.abs(difference) < 0.005) {
    return {
      ...item,
      label: "Same-cost option",
      relationship: "same-cost",
      reason: "The final estimate matches the selected model for the same usage.",
    };
  }

  if (difference < 0) {
    return {
      ...item,
      label: "Lower-cost option",
      relationship: "cheaper",
      reason: "A lower-cost model for the exact same usage.",
    };
  }

  return {
    ...item,
    label: "Higher-cost option",
    relationship: "more-expensive",
    reason: "A higher-cost model for the exact same usage.",
  };
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

export async function requestModelComparisons({ meta, costEstimateRequest }) {
  if (USING_PLACEHOLDER_API) {
    return requestPlaceholderComparisons({ meta, costEstimateRequest });
  }

  const response = await fetch(`${API_BASE_URL}${ESTIMATES_PATH}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(costEstimateRequest),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const result = await response.json();
  const baselineMeta =
    meta.find((item) => item.relationship === "selected") ?? meta[0];
  const baselineScenario = result.scenarios?.[baselineMeta?.id];

  const comparisons = meta.map((item) => {
    const scenario = result.scenarios?.[item.id];
    if (!scenario) {
      throw new Error(`The pricing service did not return scenario '${item.id}'.`);
    }
    const displayMeta = alignMetadataWithBackendTotals(
      item,
      scenario,
      baselineScenario,
    );
    return {
      id: item.id,
      label: displayMeta.label,
      relationship: displayMeta.relationship,
      reason: displayMeta.reason,
      model: { id: item.modelId, name: item.modelName },
      configuration: {
        ragEnabled:
          costEstimateRequest.scenarios.find((s) => s.id === item.id)?.forceRag ?? false,
        computeEnabled: costEstimateRequest.resources.compute,
      },
      estimate: scenario,
    };
  });

  return normalizeComparisonResponse({
    currency: result.currency,
    totalMonthlyRequests: result.totalMonthlyRequests,
    cheapestId: result.cheapestId,
    warnings: result.warnings,
    comparisons,
  });
}
