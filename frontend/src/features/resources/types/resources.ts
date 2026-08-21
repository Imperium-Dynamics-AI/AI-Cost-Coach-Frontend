export type ResourceIconType = "folder" | "openai" | "sparkle" | "search";

export type ResourceTreeNode = {
  id: string;
  name: string;
  resourceTypeLabel: string;
  region: string;
  monthlyCost: string;
  iconType: ResourceIconType;
  resourceGroup: string;
  resourceTypeFilter: string;
  hasDetail?: boolean;
  children?: ResourceTreeNode[];
};

export type ResourceFilterOption = {
  value: string;
  label: string;
};

export type ResourcesListParams = {
  search?: string;
  resourceGroup?: string;
  resourceType?: string;
  page?: number;
  pageSize?: number;
};

export type ResourcesListResult = {
  nodes: ResourceTreeNode[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
};

export type ResourceEnrichment = {
  replicas: string;
  totalSearchUnits: string;
  semanticSearch: string;
  partitions: string;
  hostingMode: string;
  status: string;
  enrichedAt: string;
};

export type ResourceRecommendation = {
  id: string;
  title: string;
  description: string;
  savingsLabel: string;
  confidence: "high" | "medium" | "low";
};

export type ResourceDetail = {
  id: string;
  name: string;
  category: string;
  subtitle: string;
  status: "succeeded" | "running" | "failed";
  subscription: string;
  resourceGroup: string;
  region: string;
  sku: string;
  kind: string;
  lastScanned: string;
  monthlyCost: string;
  enrichment: ResourceEnrichment;
  usageMessage: string;
  recommendations: ResourceRecommendation[];
};

export type ResourceFilterOptions = {
  resourceGroups: ResourceFilterOption[];
  resourceTypes: ResourceFilterOption[];
};

export interface ResourcesApi {
  getFilterOptions(): Promise<ResourceFilterOptions>;
  getResourcesList(params: ResourcesListParams): Promise<ResourcesListResult>;
  getResourceDetail(id: string): Promise<ResourceDetail>;
}
