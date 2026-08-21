"use client";

import { useCallback, useEffect, useState } from "react";
import { resourcesApi } from "@/features/resources/api";
import { getErrorMessage } from "@/features/auth/api/errors";
import { collectExpandableIds } from "@/features/resources/utils/resourceTree";
import type {
  ResourceFilterOption,
  ResourceTreeNode,
} from "@/features/resources/types/resources";

const DEFAULT_FILTERS = {
  resourceGroup: "all",
  resourceType: "all",
};

export function useResourcesList() {
  const [search, setSearch] = useState("");
  const [resourceGroup, setResourceGroup] = useState(DEFAULT_FILTERS.resourceGroup);
  const [resourceType, setResourceType] = useState(DEFAULT_FILTERS.resourceType);
  const [page, setPage] = useState(1);
  const [nodes, setNodes] = useState<ResourceTreeNode[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [resourceGroups, setResourceGroups] = useState<ResourceFilterOption[]>(
    [],
  );
  const [resourceTypes, setResourceTypes] = useState<ResourceFilterOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadFilters() {
      try {
        const options = await resourcesApi.getFilterOptions();
        if (cancelled) {
          return;
        }
        setResourceGroups(options.resourceGroups);
        setResourceTypes(options.resourceTypes);
      } catch (caught) {
        if (!cancelled) {
          setError(getErrorMessage(caught, "Unable to load resource filters."));
        }
      }
    }

    void loadFilters();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadResources() {
      setIsLoading(true);
      try {
        const result = await resourcesApi.getResourcesList({
          search,
          resourceGroup,
          resourceType,
          page,
        });

        if (cancelled) {
          return;
        }

        setNodes(result.nodes);
        setTotalPages(result.totalPages);
        setTotalItems(result.totalItems);
        setExpandedIds(new Set(collectExpandableIds(result.nodes)));
        setError(null);
      } catch (caught) {
        if (cancelled) {
          return;
        }
        setError(getErrorMessage(caught, "Unable to load resources."));
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadResources();

    return () => {
      cancelled = true;
    };
  }, [search, resourceGroup, resourceType, page]);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const onSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const onResourceGroupChange = useCallback((value: string) => {
    setResourceGroup(value);
    setPage(1);
  }, []);

  const onResourceTypeChange = useCallback((value: string) => {
    setResourceType(value);
    setPage(1);
  }, []);

  return {
    search,
    resourceGroup,
    resourceType,
    page,
    nodes,
    totalPages,
    totalItems,
    expandedIds,
    resourceGroups,
    resourceTypes,
    isLoading,
    error,
    setPage,
    toggleExpanded,
    onSearchChange,
    onResourceGroupChange,
    onResourceTypeChange,
  };
}
