import {
  DASHBOARD_OVERVIEW,
  SPEND_SERIES,
} from "@/features/dashboard/data/dashboardDummyData";
import type {
  DashboardApi,
  DashboardOverview,
  SpendRange,
  SpendSeries,
} from "@/features/dashboard/types/dashboard";

function wait(ms = 350): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export const dummyDashboardApi: DashboardApi = {
  async getOverview(): Promise<DashboardOverview> {
    await wait();
    return DASHBOARD_OVERVIEW;
  },

  async getSpendSeries(range: SpendRange): Promise<SpendSeries> {
    await wait();
    return SPEND_SERIES[range];
  },
};
