export const PLANNER_CONFIG = {
  useMock: process.env.NEXT_PUBLIC_USE_MOCK_AUTH !== "false",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
  storageKey: "planner-wizard-state",
  endpoints: {
    content: "/api/v1/planner/content",
    estimate: "/api/v1/planner/estimate",
  },
} as const;
