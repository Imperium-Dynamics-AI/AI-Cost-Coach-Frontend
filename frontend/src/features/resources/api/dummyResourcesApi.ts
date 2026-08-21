import {
  RESOURCE_DETAILS,
  RESOURCE_FILTER_OPTIONS,
  RESOURCE_TREE,
  findResourceNode,
  getDefaultResourceDetail,
} from "@/features/resources/data/resourcesDummyData";
import { RESOURCES_CONFIG } from "@/features/resources/config/resourcesConfig";
import { buildResourcesListResult } from "@/features/resources/utils/resourceTree";
import type {
  ResourceDetail,
  ResourceFilterOptions,
  ResourcesApi,
  ResourcesListParams,
  ResourcesListResult,
} from "@/features/resources/types/resources";

function wait(ms = 300): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export const dummyResourcesApi: ResourcesApi = {
  async getFilterOptions(): Promise<ResourceFilterOptions> {
    await wait();
    return RESOURCE_FILTER_OPTIONS;
  },

  async getResourcesList(
    params: ResourcesListParams,
  ): Promise<ResourcesListResult> {
    await wait();
    return buildResourcesListResult(
      RESOURCE_TREE,
      params,
      RESOURCES_CONFIG.pageSize,
    );
  },

  async getResourceDetail(id: string): Promise<ResourceDetail> {
    await wait();

    if (RESOURCE_DETAILS[id]) {
      return RESOURCE_DETAILS[id];
    }

    const node = findResourceNode(RESOURCE_TREE, id);
    if (!node) {
      throw new Error("Resource not found.");
    }

    return getDefaultResourceDetail(node);
  },
};
