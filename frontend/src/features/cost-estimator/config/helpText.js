export const HELP_TEXT = {
  openai: {
    model:
      "The selected model is sent directly to the pricing service and determines the input and output token rates used for your estimate.",
    users:
      "The number of active people expected to use the solution. The calculator applies the daily usage below to every active user.",
    requestsPerDay:
      "One question and its answer count as one interaction. The backend requires at least one interaction per active user.",
    avgPromptTokens:
      "Include the user’s question, application instructions, and recent conversation history. As a rough guide, 1,000 tokens is about 750 English words.",
    avgCompletionTokens:
      "This is the typical length of the AI response. Longer answers process more output tokens and generally cost more.",
  },
  rag: {
    enabled:
      "Document search, also called RAG, finds relevant information in your files and sends it to the AI with each question. This choice is sent with your other assumptions to the comparison service.",
    avgDocTokens:
      "This is the relevant document content retrieved and added to each AI request before the model answers.",
  },
  storage: {
    docStorageGB:
      "Enter the approximate total size of the original documents stored for the solution.",
  },
  compute: {
    enabled:
      "The current pricing service can include one Azure App Service Basic B1 instance for hosting the web application.",
  },
  global: {
    growthPct:
      "This affects the next-month and annual projections. It does not change the current monthly estimate.",
  },
};
