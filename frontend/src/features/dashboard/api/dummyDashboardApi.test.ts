import { describe, expect, it } from "vitest";
import { dummyDashboardApi } from "@/features/dashboard/api/dummyDashboardApi";

describe("dummyDashboardApi", () => {
  it("returns overview KPIs and lists", async () => {
    const overview = await dummyDashboardApi.getOverview();
    expect(overview.kpis).toHaveLength(4);
    expect(overview.highestCostResources.length).toBeGreaterThan(0);
    expect(overview.recommendations[0]?.confidence).toBe("high");
  });

  it("returns spend series for each range", async () => {
    const daily = await dummyDashboardApi.getSpendSeries("daily");
    const weekly = await dummyDashboardApi.getSpendSeries("weekly");
    const monthly = await dummyDashboardApi.getSpendSeries("monthly");

    expect(daily.points.length).toBeGreaterThan(7);
    expect(weekly.points).toHaveLength(7);
    expect(monthly.points).toHaveLength(12);
  });
});
