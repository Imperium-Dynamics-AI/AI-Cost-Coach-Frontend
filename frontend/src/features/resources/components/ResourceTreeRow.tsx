"use client";

import { useRouter } from "next/navigation";
import type { ResourceTreeNode } from "@/features/resources/types/resources";
import {
  ChevronDownSmallIcon,
  ChevronRightIcon,
  ResourceTypeIcon,
} from "@/features/resources/components/ResourceIcons";
import { cn } from "@/shared/utils/cn";

type ResourceTreeRowProps = {
  node: ResourceTreeNode;
  depth: number;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
};

export function ResourceTreeRow({
  node,
  depth,
  expandedIds,
  onToggle,
}: ResourceTreeRowProps) {
  const router = useRouter();
  const hasChildren = Boolean(node.children?.length);
  const isExpanded = expandedIds.has(node.id);

  function onRowClick() {
    if (node.hasDetail) {
      router.push(`/resources/${node.id}`);
      return;
    }

    if (hasChildren) {
      onToggle(node.id);
    }
  }

  return (
    <>
      <tr className="border-b border-[#EFEAF8]">
        <td className="py-4 pr-4">
          <div
            className="flex items-center gap-2"
            style={{ paddingLeft: `${depth * 28}px` }}
          >
            {hasChildren ? (
              <button
                type="button"
                onClick={() => onToggle(node.id)}
                className="cursor-pointer rounded p-0.5 text-brand"
                aria-label={isExpanded ? "Collapse row" : "Expand row"}
              >
                {isExpanded ? <ChevronDownSmallIcon /> : <ChevronRightIcon />}
              </button>
            ) : (
              <span className="inline-block w-[18px]" />
            )}
            <button
              type="button"
              onClick={onRowClick}
              className={cn(
                "flex min-w-0 cursor-pointer items-center gap-3 text-left",
                node.hasDetail && "hover:opacity-80",
              )}
            >
              <ResourceTypeIcon type={node.iconType} />
              <span className="truncate text-sm font-semibold text-[#5F01C3]">
                {node.name}
              </span>
            </button>
          </div>
        </td>
        <td className="hidden py-4 pr-4 text-sm text-navy sm:table-cell">
          {node.resourceTypeLabel}
        </td>
        <td className="hidden py-4 pr-4 text-sm text-navy md:table-cell">
          {node.region}
        </td>
        <td className="py-4 text-sm font-medium text-navy">{node.monthlyCost}</td>
      </tr>

      {hasChildren && isExpanded
        ? node.children?.map((child) => (
            <ResourceTreeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              onToggle={onToggle}
            />
          ))
        : null}
    </>
  );
}
