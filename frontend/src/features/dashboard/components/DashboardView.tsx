"use client";

import { KpiGrid } from "@/features/dashboard/components/KpiGrid";
import { RecommendationsList } from "@/features/dashboard/components/RecommendationsList";
import { ResourceBarList } from "@/features/dashboard/components/ResourceBarList";
import { SpendChart } from "@/features/dashboard/components/SpendChart";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import { useSpendChart } from "@/features/dashboard/hooks/useSpendChart";

export function DashboardView() {
  const { overview, isLoading, error } = useDashboard();
  const spend = useSpendChart("daily");

  if (isLoading && !overview) {
    return (
      <div className="app-shell-box rounded-3xl px-6 py-16 text-center text-purple">
        Loading dashboard...
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="app-shell-box rounded-3xl px-6 py-16 text-center text-red-500">
        {error ?? "Dashboard data is unavailable."}
      </div>
    );
  }

  return (
    <section className="app-shell-box space-y-6 rounded-3xl px-5 py-6 md:px-8 md:py-8">
      <div>
        <p className="text-base font-bold text-[#19226880]">Overview</p>
        <h1 className="mt-1 text-3xl font-bold text-navy md:text-4xl">Dashboard</h1>
        <p className="mt-2 text-lg text-[#8C52FB] md:text-xl">
          How is your Azure environment doing right now?
        </p>
        <div className="mt-5 h-px bg-[#E4D7F7]" />
      </div>

      <KpiGrid items={overview.kpis} />

      <SpendChart
        range={spend.range}
        onRangeChange={spend.setRange}
        points={spend.points}
        isLoading={spend.isLoading}
      />

      <ResourceBarList
        title="Highest-Cost Resource"
        items={overview.highestCostResources}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <ResourceBarList
          title="Top Service By Spend"
          items={overview.topServices}
        />
        <ResourceBarList
          title="Top Subscriptions By Spend"
          items={overview.topSubscriptions}
        />
      </div>

      <RecommendationsList items={overview.recommendations} />
    </section>
  );
}
