export const AI_COACH_CONFIG = {
  useMock: process.env.NEXT_PUBLIC_USE_MOCK_AUTH !== "false",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
  endpoints: {
    session: "/api/v1/ai-coach/session",
    messages: "/api/v1/ai-coach/messages",
  },
} as const;
