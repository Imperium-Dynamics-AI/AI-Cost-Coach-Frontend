import { dummyOpportunitiesApi } from "@/features/opportunities/api/dummyOpportunitiesApi";
import { httpOpportunitiesApi } from "@/features/opportunities/api/httpOpportunitiesApi";
import { OPPORTUNITIES_CONFIG } from "@/features/opportunities/config/opportunitiesConfig";
import type { OpportunitiesApi } from "@/features/opportunities/types/opportunities";

export const opportunitiesApi: OpportunitiesApi = OPPORTUNITIES_CONFIG.useMock
  ? dummyOpportunitiesApi
  : httpOpportunitiesApi;
