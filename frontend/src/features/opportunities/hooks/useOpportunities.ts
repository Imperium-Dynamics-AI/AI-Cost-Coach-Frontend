"use client";

import { useEffect, useState } from "react";
import { opportunitiesApi } from "@/features/opportunities/api";
import { getErrorMessage } from "@/features/auth/api/errors";
import type { OpportunitiesOverview } from "@/features/opportunities/types/opportunities";

export function useOpportunities() {
  const [overview, setOverview] = useState<OpportunitiesOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await opportunitiesApi.getOverview();
        if (cancelled) {
          return;
        }
        setOverview(data);
        setError(null);
      } catch (caught) {
        if (cancelled) {
          return;
        }
        setError(getErrorMessage(caught, "Unable to load opportunities."));
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { overview, isLoading, error };
}
