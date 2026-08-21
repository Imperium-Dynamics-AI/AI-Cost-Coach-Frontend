"use client";

import { useEffect, useState } from "react";
import { plannerApi } from "@/features/planner/api";
import { getErrorMessage } from "@/features/auth/api/errors";
import { PlannerModelHighlightCards } from "@/features/planner/components/PlannerModelHighlightCards";
import { PlannerReviewComparison } from "@/features/planner/components/PlannerReviewComparison";
import type {
  PlannerComparisonResult,
  PlannerEstimate,
  PlannerFormState,
} from "@/features/planner/types/planner";

type PlannerReviewComparisonSectionProps = {
  form: PlannerFormState;
  estimate: PlannerEstimate;
  isCalculating: boolean;
};

export function PlannerReviewComparisonSection({
  form,
  estimate,
  isCalculating,
}: PlannerReviewComparisonSectionProps) {
  const [comparison, setComparison] = useState<PlannerComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadComparison() {
      try {
        const result = await plannerApi.getComparison(form);
        if (!cancelled) {
          setComparison(result);
          setError(null);
        }
      } catch (caught) {
        if (!cancelled) {
          setError(getErrorMessage(caught, "Unable to load model comparison."));
        }
      }
    }

    void loadComparison();

    return () => {
      cancelled = true;
    };
  }, [form]);

  if (error) {
    return (
      <div className="app-shell-box rounded-3xl px-5 py-8 text-center text-sm text-red-500 md:px-8">
        {error}
      </div>
    );
  }

  if (!comparison) {
    return (
      <div className="app-shell-box rounded-3xl px-5 py-8 text-center text-sm text-purple md:px-8">
        Loading model comparison...
      </div>
    );
  }

  return (
    <>
      <PlannerModelHighlightCards
        comparison={comparison}
        selectedModelId={form.modelId}
      />

      <section id="planner-comparison" className="space-y-6">
        <PlannerReviewComparison
          comparison={comparison}
          estimate={estimate}
          isCalculating={isCalculating}
        />
      </section>
    </>
  );
}
