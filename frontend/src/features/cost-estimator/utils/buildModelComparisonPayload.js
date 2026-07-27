function hasCompletePricing(model) {
  return Number.isFinite(model?.inputPer1K) && Number.isFinite(model?.outputPer1K);
}

export function buildModelComparisonPayload(values, models) {
  const selectedModel = models.find(
    (model) => model.id === values.openai.modelId,
  );

  if (
    !hasCompletePricing(selectedModel) ||
    typeof values.rag.enabled !== "boolean" ||
    typeof values.compute.enabled !== "boolean"
  ) {
    throw new Error(
      "A priced model, document search, and app hosting choices are required.",
    );
  }

  return {
    selectedModelId: selectedModel.id,
    resources: {
      compute: values.compute.enabled,
    },
    openai: {
      users: values.openai.users,
      requestsPerDay: values.openai.requestsPerDay,
      avgPromptTokens: values.openai.avgPromptTokens,
      avgCompletionTokens: values.openai.avgCompletionTokens,
    },
    rag: {
      enabled: values.rag.enabled,
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
