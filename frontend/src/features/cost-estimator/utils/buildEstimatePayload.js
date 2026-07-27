import { createComparisonScenarios } from "../config/calculatorConfig.js";

export function buildEstimatePayload(values) {
  const scenarios = createComparisonScenarios(values);

  if (scenarios.length !== 3 || typeof values.compute.enabled !== "boolean") {
    throw new Error("Model, document search, and app hosting choices are required.");
  }

  const payload = {
    resources: {
      compute: values.compute.enabled,
    },
    scenarios: scenarios.map((scenario) => ({
        id: scenario.id,
        model: scenario.model,
        forceRag: scenario.forceRag,
    })),
    openai: {
      users: values.openai.users,
      requestsPerDay: values.openai.requestsPerDay,
      avgPromptTokens: values.openai.avgPromptTokens,
      avgCompletionTokens: values.openai.avgCompletionTokens,
    },
    global: {
      growthPct: values.global.growthPct,
    },
  };

  payload.rag = {
    avgDocTokens: values.rag.avgDocTokens,
  };
  payload.storage = {
    docStorageGB: values.storage.docStorageGB,
  };

  return payload;
}
