import { DASHBOARD_CONFIG } from "@/features/dashboard/config/dashboardConfig";
import { AuthApiError } from "@/features/auth/api/errors";
import type {
  DashboardApi,
  DashboardOverview,
  SpendRange,
  SpendSeries,
} from "@/features/dashboard/types/dashboard";

function getBaseUrl(): string {
  const baseUrl = DASHBOARD_CONFIG.apiBaseUrl.replace(/\/$/, "");
  if (!baseUrl) {
    throw new AuthApiError(
      "NEXT_PUBLIC_API_BASE_URL is not set. Add it before disabling mock data.",
      { status: 500, code: "MISSING_API_BASE_URL" },
    );
  }
  return baseUrl;
}

async function requestJson<T>(path: string): Promise<T> {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    headers: { Accept: "application/json" },
  });

  const payload = (await response.json().catch(() => null)) as T | null;

  if (!response.ok) {
    throw new AuthApiError("The dashboard request could not be completed.", {
      status: response.status,
    });
  }

  return payload as T;
}

export const httpDashboardApi: DashboardApi = {
  getOverview() {
    return requestJson<DashboardOverview>(DASHBOARD_CONFIG.endpoints.overview);
  },

  getSpendSeries(range: SpendRange) {
    return requestJson<SpendSeries>(
      `${DASHBOARD_CONFIG.endpoints.spend}?range=${range}`,
    );
  },
};
