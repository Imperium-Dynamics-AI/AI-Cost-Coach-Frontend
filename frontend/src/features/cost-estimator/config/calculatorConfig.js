export const SCENARIOS = [
  {
    id: "A",
    label: "Option A",
    model: "GPT-4o",
    name: "GPT-4o",
    description: "GPT-4o without document search.",
    forceRag: false,
  },
  {
    id: "B",
    label: "Option B",
    model: "GPT-4.1",
    name: "GPT-4.1",
    description: "GPT-4.1 without document search.",
    forceRag: false,
  },
  {
    id: "C",
    label: "Option C",
    model: "GPT-4o",
    name: "GPT-4o + your content",
    description: "GPT-4o with Azure AI Search and document context.",
    forceRag: true,
  },
];

export const COST_CATEGORIES = [
  { key: "openai", label: "AI model usage", availability: "always" },
  { key: "rag", label: "AI document search", availability: "rag" },
  { key: "storage", label: "Source document storage", availability: "rag" },
  { key: "compute", label: "App hosting", availability: "compute" },
];

export const SECTION_COPY = {
  openai: {
    title: "AI usage",
    description: "Tell us how many people will use the AI and how much text it will process.",
  },
  rag: {
    title: "Document search for Option C",
    description: "Estimate the extra prompt context and source-file storage used by RAG.",
  },
  compute: {
    title: "App hosting",
    description: "Optionally include the App Service instance used to host the application.",
  },
  global: {
    title: "Growth projection",
    description: "Set the expected monthly growth used for annual and next-month projections.",
  },
};

export function createInitialFormValues() {
  return {
    openai: {
      users: 500,
      requestsPerDay: 5,
      avgPromptTokens: 800,
      avgCompletionTokens: 400,
    },
    rag: { avgDocTokens: 600 },
    storage: { docStorageGB: 5 },
    compute: { enabled: false },
    global: { growthPct: 10 },
  };
}
