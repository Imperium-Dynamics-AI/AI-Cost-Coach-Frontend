"use client";

import { ConfidenceBadge } from "@/features/opportunities/components/ConfidenceBadge";
import { OpportunityActionBar } from "@/features/opportunities/components/OpportunityActionBar";
import {
  OpportunitySectionList,
  OpportunityStat,
} from "@/features/opportunities/components/OpportunitySectionList";
import { useRecommendationActions } from "@/features/opportunities/hooks/useRecommendationActions";
import type { OpportunityRecommendation } from "@/features/opportunities/types/opportunities";

type OpportunityRecommendationCardProps = {
  recommendation: OpportunityRecommendation;
};

export function OpportunityRecommendationCard({
  recommendation,
}: OpportunityRecommendationCardProps) {
  const actions = useRecommendationActions(recommendation.id);

  return (
    <div className="space-y-6 px-1 md:px-2">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 max-w-4xl">
          <h2 className="text-2xl font-bold text-navy md:text-3xl">
            {recommendation.title}
          </h2>
          <p className="mt-2 text-sm text-[#19226880] md:text-base">
            {recommendation.resourceName} · {recommendation.opportunityType} ·{" "}
            {recommendation.savingsSummary}
          </p>
        </div>
        <ConfidenceBadge confidence={recommendation.confidence} />
      </div>

      <div>
        <h3 className="text-base font-bold tracking-wide text-navy uppercase md:text-lg">
          Why
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[#8C52FB] md:text-base">
          {recommendation.why}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OpportunityStat label="Current" value={recommendation.currentCost} />
        <OpportunityStat label="Projected" value={recommendation.projectedCost} />
        <OpportunityStat
          label="Monthly savings"
          value={recommendation.monthlySavings}
        />
        <OpportunityStat
          label="Annual savings"
          value={recommendation.annualSavings}
        />
      </div>

      <div className="space-y-6">
        <OpportunitySectionList title="Evidence" items={recommendation.evidence} />
        <OpportunitySectionList
          title="Assumptions"
          items={recommendation.assumptions}
        />
        <OpportunitySectionList title="Risks" items={recommendation.risks} />
        <OpportunitySectionList
          title="Limitations"
          items={recommendation.limitations}
        />
      </div>

      <p className="text-xs text-navy md:text-sm">{recommendation.ruleLabel}</p>

      {actions.error ? (
        <p className="text-sm text-red-500">{actions.error}</p>
      ) : null}

      {actions.activeAction ? (
        <p className="text-sm font-medium text-brand">
          Recommendation {actions.activeAction}d successfully.
        </p>
      ) : null}

      <OpportunityActionBar
        isSubmitting={actions.isSubmitting}
        activeAction={actions.activeAction}
        onSnooze={actions.snooze}
        onDismiss={actions.dismiss}
        onAccept={actions.accept}
      />
    </div>
  );
}
