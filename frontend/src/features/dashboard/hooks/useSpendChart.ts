"use client";

import { useEffect, useState } from "react";
import { dashboardApi } from "@/features/dashboard/api";
import { getErrorMessage } from "@/features/auth/api/errors";
import type {
  SpendPoint,
  SpendRange,
} from "@/features/dashboard/types/dashboard";

export function useSpendChart(initialRange: SpendRange = "daily") {
  const [range, setRange] = useState<SpendRange>(initialRange);
  const [points, setPoints] = useState<SpendPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const series = await dashboardApi.getSpendSeries(range);
        if (cancelled) {
          return;
        }
        setPoints(series.points);
        setError(null);
      } catch (caught) {
        if (cancelled) {
          return;
        }
        setError(getErrorMessage(caught, "Unable to load spend chart data."));
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
  }, [range]);

  return {
    range,
    setRange,
    points,
    isLoading,
    error,
  };
}
