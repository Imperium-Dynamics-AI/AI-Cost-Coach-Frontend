import { RESOURCES_CONFIG } from "@/features/resources/config/resourcesConfig";
import type {
  ResourceDetail,
  ResourceFilterOptions,
  ResourcesApi,
  ResourcesListParams,
  ResourcesListResult,
} from "@/features/resources/types/resources";

export const httpResourcesApi: ResourcesApi = {
  async getFilterOptions(): Promise<ResourceFilterOptions> {
    const response = await fetch(
      `${RESOURCES_CONFIG.apiBaseUrl}${RESOURCES_CONFIG.endpoints.filters}`,
    );
    if (!response.ok) {
      throw new Error("Unable to load resource filters.");
    }
    return response.json() as Promise<ResourceFilterOptions>;
  },

  async getResourcesList(
    params: ResourcesListParams,
  ): Promise<ResourcesListResult> {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.resourceGroup) query.set("resourceGroup", params.resourceGroup);
    if (params.resourceType) query.set("resourceType", params.resourceType);
    if (params.page) query.set("page", String(params.page));

    const response = await fetch(
      `${RESOURCES_CONFIG.apiBaseUrl}${RESOURCES_CONFIG.endpoints.list}?${query}`,
    );
    if (!response.ok) {
      throw new Error("Unable to load resources.");
    }
    return response.json() as Promise<ResourcesListResult>;
  },

  async getResourceDetail(id: string): Promise<ResourceDetail> {
    const response = await fetch(
      `${RESOURCES_CONFIG.apiBaseUrl}${RESOURCES_CONFIG.endpoints.detail}/${id}`,
    );
    if (!response.ok) {
      throw new Error("Unable to load resource details.");
    }
    return response.json() as Promise<ResourceDetail>;
  },
};
