"use client";

import { ResourceDetailView } from "@/features/resources/components/ResourceDetailView";
import { useResourceDetail } from "@/features/resources/hooks/useResourceDetail";

type ResourceDetailPageProps = {
  resourceId: string;
};

export function ResourceDetailPage({ resourceId }: ResourceDetailPageProps) {
  const { detail, isLoading, error } = useResourceDetail(resourceId);

  if (isLoading && !detail) {
    return (
      <div className="app-shell-box rounded-3xl px-6 py-16 text-center text-purple">
        Loading resource details...
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="app-shell-box rounded-3xl px-6 py-16 text-center text-red-500">
        {error ?? "Resource details are unavailable."}
      </div>
    );
  }

  return <ResourceDetailView detail={detail} />;
}
