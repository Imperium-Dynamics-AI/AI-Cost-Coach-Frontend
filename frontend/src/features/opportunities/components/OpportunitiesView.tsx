"use client";

import { OpportunityRecommendationsList } from "@/features/opportunities/components/OpportunityRecommendationsList";
import { OpportunityMetricsGrid } from "@/features/opportunities/components/OpportunityMetricsGrid";
import { useOpportunities } from "@/features/opportunities/hooks/useOpportunities";

export function OpportunitiesView() {
  const { overview, isLoading, error } = useOpportunities();

  if (isLoading && !overview) {
    return (
      <div className="app-shell-box rounded-3xl px-6 py-16 text-center text-purple">
        Loading opportunities...
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="app-shell-box rounded-3xl px-6 py-16 text-center text-red-500">
        {error ?? "Opportunities data is unavailable."}
      </div>
    );
  }

  return (
    <section className="app-shell-box space-y-6 rounded-3xl px-5 py-6 md:px-8 md:py-8">
      <div>
        <p className="text-sm font-bold text-[#19226880]">Opportunities</p>
        <h1 className="mt-1 text-3xl font-bold text-navy md:text-4xl">
          Recommendations
        </h1>
        <p className="mt-2 text-base text-[#8C52FB] md:text-lg">
          Where can we potentially save money?
        </p>
        <div className="mt-5 h-px bg-[#E4D7F7]" />
      </div>

      <OpportunityMetricsGrid items={overview.metrics} />

      <div className="mt-6 md:mt-10">
        <OpportunityRecommendationsList
          recommendations={overview.recommendations}
        />
      </div>
    </section>
  );
}
