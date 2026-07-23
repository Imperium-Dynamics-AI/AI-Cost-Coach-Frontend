import { SCENARIOS } from "../config/calculatorConfig.js";

export function buildEstimatePayload(values) {
  return {
    resources: {
      compute: values.compute.enabled,
    },
    scenarios: SCENARIOS.map(({ id, model, forceRag }) => ({
      id,
      model,
      forceRag,
    })),
    openai: {
      users: values.openai.users,
      requestsPerDay: values.openai.requestsPerDay,
      avgPromptTokens: values.openai.avgPromptTokens,
      avgCompletionTokens: values.openai.avgCompletionTokens,
    },
    rag: {
      avgDocTokens: values.rag.avgDocTokens,
    },
    storage: {
      docStorageGB: values.storage.docStorageGB,
    },
    global: {
      growthPct: values.global.growthPct,
    },
  };
}
