export const COST_CATEGORIES = [
  { key: "openai", label: "AI model usage", availability: "always" },
  { key: "rag", label: "AI document search", availability: "rag" },
  { key: "storage", label: "Source document storage", availability: "rag" },
  { key: "compute", label: "App hosting", availability: "compute" },
];

export function createInitialFormValues() {
  return {
    openai: {
      modelId: "",
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
