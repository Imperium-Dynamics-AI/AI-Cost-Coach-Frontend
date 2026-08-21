import type {
  ResourceDetail,
  ResourceFilterOption,
  ResourceTreeNode,
} from "@/features/resources/types/resources";

const RESOURCE_GROUPS: ResourceFilterOption[] = [
  { value: "all", label: "Resource Group" },
  { value: "rg-rag-pipeline", label: "rg-rag-pipeline" },
  { value: "rg-ai-prod", label: "rg-ai-prod" },
  { value: "rg-search-prod", label: "rg-search-prod" },
  { value: "rg-data-platform", label: "rg-data-platform" },
];

const RESOURCE_TYPES: ResourceFilterOption[] = [
  { value: "all", label: "Resource Type" },
  { value: "subscription", label: "Subscription" },
  { value: "resource-group", label: "Resource Group" },
  { value: "azure-openai", label: "Azure OpenAI" },
  { value: "model-development", label: "Model Development" },
  { value: "azure-ai-search", label: "Azure AI Search" },
];

function createOpenAiBranch(
  prefix: string,
  resourceGroup: string,
): ResourceTreeNode[] {
  return [
    {
      id: `${prefix}-oai`,
      name: `${prefix}-oai-prod-eastus`,
      resourceTypeLabel: "Resource Group",
      region: "Global",
      monthlyCost: "$165.9",
      iconType: "openai",
      resourceGroup,
      resourceTypeFilter: "resource-group",
      children: [
        {
          id: `${prefix}-gpt4o`,
          name: "gpt-4o-2024",
          resourceTypeLabel: "Azure OpenAI",
          region: "Global",
          monthlyCost: "$165.9",
          iconType: "sparkle",
          resourceGroup,
          resourceTypeFilter: "azure-openai",
          hasDetail: true,
        },
        {
          id: `${prefix}-gpt41`,
          name: "gpt-4.1-2025",
          resourceTypeLabel: "Model Development",
          region: "Global",
          monthlyCost: "$165.9",
          iconType: "sparkle",
          resourceGroup,
          resourceTypeFilter: "model-development",
          hasDetail: true,
        },
      ],
    },
  ];
}

function createSubscription(index: number): ResourceTreeNode {
  const id = `sub-${index}`;
  const names = [
    "rg-rag-pipeline",
    "rg-ai-prod-east",
    "rg-search-prod",
    "rg-data-platform",
    "rg-analytics-core",
  ];
  const name = names[index % names.length] ?? `rg-subscription-${index}`;
  const resourceGroup =
    RESOURCE_GROUPS[(index % (RESOURCE_GROUPS.length - 1)) + 1]?.value ??
    "rg-rag-pipeline";

  return {
    id,
    name: index === 0 ? "rg-rag-pipeline" : `${name}-${index}`,
    resourceTypeLabel: "Subscription",
    region: "Global",
    monthlyCost: "$165.9",
    iconType: "folder",
    resourceGroup,
    resourceTypeFilter: "subscription",
    children: createOpenAiBranch(`${id}`, resourceGroup),
  };
}

function createFeaturedSubscription(): ResourceTreeNode {
  return {
    id: "sub-0",
    name: "rg-rag-pipeline",
    resourceTypeLabel: "Subscription",
    region: "Global",
    monthlyCost: "$165.9",
    iconType: "folder",
    resourceGroup: "rg-rag-pipeline",
    resourceTypeFilter: "subscription",
    children: [
      {
        id: "sub-0-oai",
        name: "oai-prod-eastus",
        resourceTypeLabel: "Resource Group",
        region: "Global",
        monthlyCost: "$165.9",
        iconType: "openai",
        resourceGroup: "rg-rag-pipeline",
        resourceTypeFilter: "resource-group",
        children: [
          {
            id: "sub-0-gpt4o",
            name: "gpt-4o-2024",
            resourceTypeLabel: "Azure OpenAI",
            region: "Global",
            monthlyCost: "$165.9",
            iconType: "sparkle",
            resourceGroup: "rg-rag-pipeline",
            resourceTypeFilter: "azure-openai",
            hasDetail: true,
          },
          {
            id: "sub-0-gpt41",
            name: "gpt-4.1-2025",
            resourceTypeLabel: "Model Development",
            region: "Global",
            monthlyCost: "$165.9",
            iconType: "sparkle",
            resourceGroup: "rg-rag-pipeline",
            resourceTypeFilter: "model-development",
            hasDetail: true,
          },
        ],
      },
      {
        id: "aisearch",
        name: "aisearch-prod-index",
        resourceTypeLabel: "Azure AI Search",
        region: "Global",
        monthlyCost: "$165.9",
        iconType: "search",
        resourceGroup: "rg-rag-pipeline",
        resourceTypeFilter: "azure-ai-search",
        hasDetail: true,
      },
    ],
  };
}

export const RESOURCE_TREE: ResourceTreeNode[] = [
  createFeaturedSubscription(),
  ...Array.from({ length: 34 }, (_, index) => createSubscription(index + 1)),
];

export const RESOURCE_FILTER_OPTIONS = {
  resourceGroups: RESOURCE_GROUPS,
  resourceTypes: RESOURCE_TYPES,
};

export const RESOURCE_DETAILS: Record<string, ResourceDetail> = {
  "sub-0-gpt4o": {
    id: "sub-0-gpt4o",
    name: "gpt-4o-2024",
    category: "AZURE OPENAI",
    subtitle: "What's happening with this resource?",
    status: "succeeded",
    subscription: "Production",
    resourceGroup: "rg-rag-pipeline",
    region: "eastus",
    sku: "standard. STANDARD",
    kind: "OpenAI",
    lastScanned: "02 days ago",
    monthlyCost: "$18,421",
    enrichment: {
      replicas: "02",
      totalSearchUnits: "04",
      semanticSearch: "Standard",
      partitions: "02",
      hostingMode: "default",
      status: "running",
      enrichedAt: "Enriched 2 days ago",
    },
    usageMessage:
      "Usage metrics aren't collected yet - this depends on the Azure Monitor integration, which hasn't been built.",
    recommendations: [
      {
        id: "rec-1",
        title: "Switch GPT-4.1 → GPT-4.1 Mini",
        description:
          "gpt-4o-2024. Saving opportunity. Save $370/mo",
        savingsLabel: "$370/mo",
        confidence: "medium",
      },
    ],
  },
  "sub-0-gpt41": {
    id: "sub-0-gpt41",
    name: "gpt-4.1-2025",
    category: "MODEL DEVELOPMENT",
    subtitle: "What's happening with this resource?",
    status: "succeeded",
    subscription: "Production",
    resourceGroup: "rg-rag-pipeline",
    region: "eastus",
    sku: "standard. STANDARD",
    kind: "ModelDeployment",
    lastScanned: "02 days ago",
    monthlyCost: "$18,421",
    enrichment: {
      replicas: "02",
      totalSearchUnits: "04",
      semanticSearch: "Standard",
      partitions: "02",
      hostingMode: "default",
      status: "running",
      enrichedAt: "Enriched 2 days ago",
    },
    usageMessage:
      "Usage metrics aren't collected yet - this depends on the Azure Monitor integration, which hasn't been built.",
    recommendations: [
      {
        id: "rec-2",
        title: "Switch GPT-4.1 → GPT-4.1 Mini",
        description:
          "gpt-4.1-2025. Saving opportunity. Save $370/mo",
        savingsLabel: "$370/mo",
        confidence: "medium",
      },
    ],
  },
  aisearch: {
    id: "aisearch",
    name: "aisearch-prod-index",
    category: "AZURE AI SEARCH",
    subtitle: "What's happening with this resource?",
    status: "succeeded",
    subscription: "Production",
    resourceGroup: "rg-ai-prod",
    region: "eastus",
    sku: "standard. STANDARD",
    kind: "SearchService",
    lastScanned: "02 days ago",
    monthlyCost: "$18,421",
    enrichment: {
      replicas: "02",
      totalSearchUnits: "04",
      semanticSearch: "Standard",
      partitions: "02",
      hostingMode: "default",
      status: "running",
      enrichedAt: "Enriched 2 days ago",
    },
    usageMessage:
      "Usage metrics aren't collected yet - this depends on the Azure Monitor integration, which hasn't been built.",
    recommendations: [
      {
        id: "rec-search-1",
        title: "Right-size AI Search from Standard to Basic",
        description:
          "aisearch-prod-index. Saving opportunity. Save $370/mo",
        savingsLabel: "$370/mo",
        confidence: "medium",
      },
    ],
  },
};

export function getDefaultResourceDetail(node: ResourceTreeNode): ResourceDetail {
  return {
    id: node.id,
    name: node.name,
    category: node.resourceTypeLabel.toUpperCase(),
    subtitle: "What's happening with this resource?",
    status: "succeeded",
    subscription: "Production",
    resourceGroup: node.resourceGroup,
    region: "eastus",
    sku: "standard. STANDARD",
    kind: node.resourceTypeLabel.replace(/\s+/g, ""),
    lastScanned: "02 days ago",
    monthlyCost: "$18,421",
    enrichment: {
      replicas: "02",
      totalSearchUnits: "04",
      semanticSearch: "Standard",
      partitions: "02",
      hostingMode: "default",
      status: "running",
      enrichedAt: "Enriched 2 days ago",
    },
    usageMessage:
      "Usage metrics aren't collected yet - this depends on the Azure Monitor integration, which hasn't been built.",
    recommendations: [
      {
        id: `rec-${node.id}`,
        title: "Right-size AI Search from Standard to Basic",
        description: `${node.name}. Saving opportunity. Save $370/mo`,
        savingsLabel: "$370/mo",
        confidence: "medium",
      },
    ],
  };
}

export function findResourceNode(
  nodes: ResourceTreeNode[],
  id: string,
): ResourceTreeNode | null {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }
    if (node.children) {
      const found = findResourceNode(node.children, id);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

export function collectDetailResourceIds(nodes: ResourceTreeNode[] = RESOURCE_TREE): string[] {
  const ids: string[] = [];

  for (const node of nodes) {
    if (node.hasDetail) {
      ids.push(node.id);
    }
    if (node.children) {
      ids.push(...collectDetailResourceIds(node.children));
    }
  }

  return ids;
}
