"use client";

import { ResourcesPagination } from "@/features/resources/components/ResourcesPagination";
import { ResourcesTable } from "@/features/resources/components/ResourcesTable";
import { ResourcesToolbar } from "@/features/resources/components/ResourcesToolbar";
import { useResourcesList } from "@/features/resources/hooks/useResourcesList";

export function ResourcesView() {
  const {
    search,
    resourceGroup,
    resourceType,
    page,
    nodes,
    totalPages,
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
  } = useResourcesList();

  if (error) {
    return (
      <div className="app-shell-box rounded-3xl px-6 py-16 text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <section className="app-shell-box space-y-6 rounded-3xl px-5 py-6 md:px-8 md:py-8">
      <div>
        <p className="text-sm font-bold tracking-wide text-[#19226880] uppercase">
          Inventory
        </p>
        <h1 className="mt-1 text-3xl font-bold text-navy md:text-4xl">Resources</h1>
        <p className="mt-2 text-base text-[#8C52FB] md:text-lg">
          What Azure resources do we have?
        </p>
        <div className="mt-5 h-px bg-[#E4D7F7]" />
      </div>

      <ResourcesToolbar
        search={search}
        resourceGroup={resourceGroup}
        resourceType={resourceType}
        resourceGroups={resourceGroups}
        resourceTypes={resourceTypes}
        onSearchChange={onSearchChange}
        onResourceGroupChange={onResourceGroupChange}
        onResourceTypeChange={onResourceTypeChange}
      />

      {isLoading ? (
        <div className="py-16 text-center text-purple">Loading resources...</div>
      ) : (
        <div className="space-y-4">
          <ResourcesTable
            nodes={nodes}
            expandedIds={expandedIds}
            onToggle={toggleExpanded}
          />

          <ResourcesPagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </section>
  );
}
