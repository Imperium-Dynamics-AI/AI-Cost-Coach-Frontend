export const MODEL_OPTIONS = [
  {
    value: "GPT-4o",
    label: "GPT-4o",
    description: "Fast, balanced, general-purpose AI experiences.",
  },
  {
    value: "GPT-4.1",
    label: "GPT-4.1",
    description: "Complex instructions, detailed analysis, and precise work.",
  },
];

export const COST_CATEGORIES = [
  { key: "openai", label: "AI model usage", availability: "always" },
  { key: "rag", label: "AI document search", availability: "rag" },
  { key: "storage", label: "Source document storage", availability: "rag" },
  { key: "compute", label: "App hosting", availability: "compute" },
];

export function createComparisonScenarios(values) {
  const selectedOption = MODEL_OPTIONS.find(
    (option) => option.value === values.openai.model,
  );

  if (!selectedOption || typeof values.rag.enabled !== "boolean") {
    return [];
  }

  const usesRag = values.rag.enabled;
  const selectedModel = selectedOption.value;
  const alternativeModel = MODEL_OPTIONS.find(
    (option) => option.value !== selectedModel,
  )?.value;

  const scenarios = [
    {
      id: "A",
      label: "Option A",
      role: usesRag ? "Your selected setup with RAG" : "Your selected model",
      model: selectedModel,
      forceRag: usesRag,
    },
    {
      id: "B",
      label: "Option B",
      role: usesRag ? "Alternative model with RAG" : "Alternative model",
      model: alternativeModel,
      forceRag: usesRag,
    },
  ];

  scenarios.push({
    id: "C",
    label: "Option C",
    role: usesRag
      ? "Your selected model without RAG"
      : "Your selected model with RAG",
    model: selectedModel,
    forceRag: !usesRag,
  });

  return scenarios
    .filter((scenario) => scenario.model)
    .map((scenario) => ({
      ...scenario,
      name: scenario.forceRag ? `${scenario.model} + your content` : scenario.model,
      description: scenario.forceRag
        ? `${scenario.model} with the same business documents and usage assumptions.`
        : `${scenario.model} without document search and with the same usage assumptions.`,
    }));
}

export function createInitialFormValues() {
  return {
    openai: {
      model: "",
      users: 500,
      requestsPerDay: 5,
      avgPromptTokens: 800,
      avgCompletionTokens: 400,
    },
    rag: {
      enabled: null,
      avgDocTokens: 600,
    },
    storage: { docStorageGB: 5 },
    compute: { enabled: null },
    global: { growthPct: 10 },
  };
}
