import type { ResourceTreeNode } from "@/features/resources/types/resources";
import { ResourceTreeRow } from "@/features/resources/components/ResourceTreeRow";

type ResourcesTableProps = {
  nodes: ResourceTreeNode[];
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
};

export function ResourcesTable({
  nodes,
  expandedIds,
  onToggle,
}: ResourcesTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E4D7F7] bg-white">
      <div className="overflow-x-auto px-4 py-5 md:px-6">
        <table className="min-w-[640px] w-full border-collapse">
          <thead>
            <tr className="border-b border-[#E4D7F7]">
              <th className="pb-4 text-left text-sm font-bold text-[#8C52FB]">
                Subscription
              </th>
              <th className="hidden pb-4 text-left text-sm font-bold text-[#8C52FB] sm:table-cell">
                Resource Type
              </th>
              <th className="hidden pb-4 text-left text-sm font-bold text-[#8C52FB] md:table-cell">
                Region
              </th>
              <th className="pb-4 text-left text-sm font-bold text-[#8C52FB]">
                Monthly Cost
              </th>
            </tr>
          </thead>
          <tbody>
            {nodes.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-10 text-center text-sm text-navy/60">
                  No resources match your filters.
                </td>
              </tr>
            ) : (
              nodes.map((node) => (
                <ResourceTreeRow
                  key={node.id}
                  node={node}
                  depth={0}
                  expandedIds={expandedIds}
                  onToggle={onToggle}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
