import { dummyDashboardApi } from "@/features/dashboard/api/dummyDashboardApi";
import { httpDashboardApi } from "@/features/dashboard/api/httpDashboardApi";
import { DASHBOARD_CONFIG } from "@/features/dashboard/config/dashboardConfig";
import type { DashboardApi } from "@/features/dashboard/types/dashboard";

export const dashboardApi: DashboardApi = DASHBOARD_CONFIG.useMock
  ? dummyDashboardApi
  : httpDashboardApi;
