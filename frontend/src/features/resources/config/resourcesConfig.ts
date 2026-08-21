/**
 * Swap dummy resources data for a live backend by setting:
 *   NEXT_PUBLIC_USE_MOCK_AUTH=false
 *   NEXT_PUBLIC_API_BASE_URL=https://your-api-host
 */
export const RESOURCES_CONFIG = {
  useMock: process.env.NEXT_PUBLIC_USE_MOCK_AUTH !== "false",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
  endpoints: {
    list: "/api/v1/resources",
    detail: "/api/v1/resources",
    filters: "/api/v1/resources/filters",
  },
  pageSize: 5,
} as const;
