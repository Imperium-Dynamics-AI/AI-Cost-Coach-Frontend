import { pickComparisonModels } from "./pickComparisonModels.js";

function hasCompletePricing(model) {
  return Number.isFinite(model?.inputPer1K) && Number.isFinite(model?.outputPer1K);
}

// Builds the request for the existing, working POST /api/v1/cost-estimates
// endpoint — not the unimplemented /api/v1/model-comparisons contract.
// The deployment assumptions (users, tokens, RAG, compute, growth) are
// identical across every scenario; only the model differs per scenario,
// matching the "do not change the scenario when comparing models" rule.
export function buildModelComparisonPayload(values, models, catalog) {
  const selectedModel = models.find((model) => model.id === values.openai.modelId);

  if (
    !hasCompletePricing(selectedModel) ||
    typeof values.rag.enabled !== "boolean" ||
    typeof values.compute.enabled !== "boolean"
  ) {
    throw new Error(
      "A priced model, document search, and app hosting choices are required.",
    );
  }

  const comparisonModels = pickComparisonModels(values, catalog);
  if (!comparisonModels) {
    throw new Error("Could not rank the selected model against the priced catalog.");
  }

  return {
    meta: comparisonModels.map(({ id, label, relationship, reason, model }) => ({
      id,
      label,
      relationship,
      reason,
      modelId: model.id,
      modelName: model.name,
    })),
    costEstimateRequest: {
      resources: { compute: values.compute.enabled },
      scenarios: comparisonModels.map(({ id, model }) => ({
        id,
        model: model.name,
        forceRag: values.rag.enabled,
      })),
      openai: {
        users: values.openai.users,
        requestsPerDay: values.openai.requestsPerDay,
        avgPromptTokens: values.openai.avgPromptTokens,
        avgCompletionTokens: values.openai.avgCompletionTokens,
      },
      // Hidden RAG fields are irrelevant when RAG is disabled. Normalizing
      // them prevents an old invalid draft value from causing a backend 422.
      rag: { avgDocTokens: values.rag.enabled ? values.rag.avgDocTokens : 0 },
      storage: {
        docStorageGB: values.rag.enabled ? values.storage.docStorageGB : 0,
      },
      global: { growthPct: values.global.growthPct },
    },
  };
}
