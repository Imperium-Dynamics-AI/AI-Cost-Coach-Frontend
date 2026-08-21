import { dummyResourcesApi } from "@/features/resources/api/dummyResourcesApi";
import { httpResourcesApi } from "@/features/resources/api/httpResourcesApi";
import { RESOURCES_CONFIG } from "@/features/resources/config/resourcesConfig";
import type { ResourcesApi } from "@/features/resources/types/resources";

export const resourcesApi: ResourcesApi = RESOURCES_CONFIG.useMock
  ? dummyResourcesApi
  : httpResourcesApi;
