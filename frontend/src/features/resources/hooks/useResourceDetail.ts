"use client";

import { useEffect, useState } from "react";
import { resourcesApi } from "@/features/resources/api";
import { getErrorMessage } from "@/features/auth/api/errors";
import type { ResourceDetail } from "@/features/resources/types/resources";

export function useResourceDetail(resourceId: string) {
  const [detail, setDetail] = useState<ResourceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const data = await resourcesApi.getResourceDetail(resourceId);
        if (cancelled) {
          return;
        }
        setDetail(data);
        setError(null);
      } catch (caught) {
        if (cancelled) {
          return;
        }
        setError(getErrorMessage(caught, "Unable to load resource details."));
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
  }, [resourceId]);

  return { detail, isLoading, error };
}
