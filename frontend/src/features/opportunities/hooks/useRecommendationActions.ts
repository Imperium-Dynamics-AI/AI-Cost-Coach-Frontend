"use client";

import { useCallback, useState } from "react";
import { opportunitiesApi } from "@/features/opportunities/api";
import { getErrorMessage } from "@/features/auth/api/errors";
import type { RecommendationAction } from "@/features/opportunities/types/opportunities";

export function useRecommendationActions(recommendationId: string) {
  const [activeAction, setActiveAction] = useState<RecommendationAction>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAction = useCallback(
    async (action: Exclude<RecommendationAction, null>) => {
      setIsSubmitting(true);
      setError(null);

      try {
        if (action === "snooze") {
          await opportunitiesApi.snoozeRecommendation(recommendationId);
        } else if (action === "dismiss") {
          await opportunitiesApi.dismissRecommendation(recommendationId);
        } else {
          await opportunitiesApi.acceptRecommendation(recommendationId);
        }
        setActiveAction(action);
      } catch (caught) {
        setError(getErrorMessage(caught, "Unable to update recommendation."));
      } finally {
        setIsSubmitting(false);
      }
    },
    [recommendationId],
  );

  return {
    activeAction,
    isSubmitting,
    error,
    snooze: () => void runAction("snooze"),
    dismiss: () => void runAction("dismiss"),
    accept: () => void runAction("accept"),
  };
}
