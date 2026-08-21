"use client";

import { useEffect, useState } from "react";
import { dashboardApi } from "@/features/dashboard/api";
import { getErrorMessage } from "@/features/auth/api/errors";
import type { DashboardOverview } from "@/features/dashboard/types/dashboard";

export function useDashboard() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await dashboardApi.getOverview();
        if (cancelled) {
          return;
        }
        setOverview(data);
        setError(null);
      } catch (caught) {
        if (cancelled) {
          return;
        }
        setError(getErrorMessage(caught, "Unable to load dashboard data."));
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
