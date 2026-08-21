/**
 * Swap dummy data for a live backend by setting:
 *   NEXT_PUBLIC_USE_MOCK_AUTH=false
 *   NEXT_PUBLIC_API_BASE_URL=https://your-api-host
 *
 * If the backend uses different paths, change `endpoints` only.
 * Forms, hooks, and components do not need to change.
 */
export const AUTH_CONFIG = {
  useMock: process.env.NEXT_PUBLIC_USE_MOCK_AUTH !== "false",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
  endpoints: {
    login: "/api/v1/auth/login",
    signup: "/api/v1/auth/signup",
    forgotPassword: "/api/v1/auth/forgot-password",
    entra: "/api/v1/auth/entra",
    me: "/api/v1/auth/me",
    logout: "/api/v1/auth/logout",
  },
} as const;
