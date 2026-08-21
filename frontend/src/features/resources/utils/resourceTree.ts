import type {
  ResourceTreeNode,
  ResourcesListParams,
  ResourcesListResult,
} from "@/features/resources/types/resources";

function nodeMatchesSearch(node: ResourceTreeNode, search: string): boolean {
  const query = search.trim().toLowerCase();
  if (!query) {
    return true;
  }

  if (node.name.toLowerCase().includes(query)) {
    return true;
  }

  return (node.children ?? []).some((child) => nodeMatchesSearch(child, query));
}

function filterNode(
  node: ResourceTreeNode,
  params: ResourcesListParams,
): ResourceTreeNode | null {
  const search = params.search?.trim().toLowerCase() ?? "";
  const resourceGroup = params.resourceGroup ?? "all";
  const resourceType = params.resourceType ?? "all";

  const groupMatch =
    resourceGroup === "all" || node.resourceGroup === resourceGroup;
  const typeMatch =
    resourceType === "all" || node.resourceTypeFilter === resourceType;

  const filteredChildren = (node.children ?? [])
    .map((child) => filterNode(child, params))
    .filter((child): child is ResourceTreeNode => child !== null);

  const selfMatchesSearch = search
    ? node.name.toLowerCase().includes(search)
    : true;
  const subtreeMatchesSearch = search ? nodeMatchesSearch(node, search) : true;

  if (!subtreeMatchesSearch) {
    return null;
  }

  if (filteredChildren.length > 0) {
    return { ...node, children: filteredChildren };
  }

  if (groupMatch && typeMatch && selfMatchesSearch) {
    return { ...node, children: undefined };
  }

  if (search && selfMatchesSearch) {
    return { ...node, children: undefined };
  }

  return null;
}

export function buildResourcesListResult(
  allNodes: ResourceTreeNode[],
  params: ResourcesListParams,
  pageSize: number,
): ResourcesListResult {
  const page = Math.max(params.page ?? 1, 1);
  const filtered = allNodes
    .map((node) => filterNode(node, params))
    .filter((node): node is ResourceTreeNode => node !== null);

  const totalItems = filtered.length;
  const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const nodes = filtered.slice(start, start + pageSize);

  return {
    nodes,
    totalPages,
    currentPage,
    totalItems,
  };
}

export function collectExpandableIds(nodes: ResourceTreeNode[]): string[] {
  return nodes.flatMap((node) => [
    node.id,
    ...collectExpandableIds(node.children ?? []),
  ]);
}
