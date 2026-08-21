export const OPPORTUNITIES_CONFIG = {
  useMock: process.env.NEXT_PUBLIC_USE_MOCK_AUTH !== "false",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
  endpoints: {
    overview: "/api/v1/opportunities",
    snooze: "/api/v1/opportunities/recommendations",
    dismiss: "/api/v1/opportunities/recommendations",
    accept: "/api/v1/opportunities/recommendations",
  },
} as const;
