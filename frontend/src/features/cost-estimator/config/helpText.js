export const HELP_TEXT = {
  openai: {
    users:
      "The number of active people expected to use the solution. The backend multiplies this by daily interactions and 30 days to estimate monthly request volume.",
    requestsPerDay:
      "How many questions or AI-powered actions one person performs on an average day. The backend requires at least one interaction per person.",
    avgPromptTokens:
      "The average amount of user and application text sent with each request. Tokens are small pieces of text used for AI billing.",
    avgCompletionTokens:
      "The average length of the AI response. Longer responses process more output tokens and generally cost more.",
  },
  rag: {
    avgDocTokens:
      "For Option C, this is the average amount of text retrieved from your documents and added to each AI prompt.",
  },
  storage: {
    docStorageGB:
      "For Option C, this is the total space used by source documents. The backend uses it to estimate Blob Storage cost.",
  },
  compute: {
    enabled:
      "Turn this on to include one Basic B1 App Service instance in every scenario. The current backend supports only this hosting size.",
  },
  global: {
    growthPct:
      "The expected month-over-month usage growth. The backend compounds it for the annual estimate and applies it to the next-month projection.",
  },
};
