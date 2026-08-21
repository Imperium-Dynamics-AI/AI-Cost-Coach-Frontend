/**
 * Swap dummy dashboard data for a live backend by setting:
 *   NEXT_PUBLIC_USE_MOCK_AUTH=false
 *   NEXT_PUBLIC_API_BASE_URL=https://your-api-host
 *
 * Screens, hooks, and components already consume DashboardApi.
 */
export const DASHBOARD_CONFIG = {
  useMock: process.env.NEXT_PUBLIC_USE_MOCK_AUTH !== "false",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
  endpoints: {
    overview: "/api/v1/dashboard",
    spend: "/api/v1/dashboard/spend",
  },
} as const;
