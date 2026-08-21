import { OPPORTUNITIES_OVERVIEW } from "@/features/opportunities/data/opportunitiesDummyData";
import type {
  OpportunitiesApi,
  OpportunitiesOverview,
} from "@/features/opportunities/types/opportunities";

function wait(ms = 300): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export const dummyOpportunitiesApi: OpportunitiesApi = {
  async getOverview(): Promise<OpportunitiesOverview> {
    await wait();
    return OPPORTUNITIES_OVERVIEW;
  },

  async snoozeRecommendation(): Promise<void> {
    await wait(200);
  },

  async dismissRecommendation(): Promise<void> {
    await wait(200);
  },

  async acceptRecommendation(): Promise<void> {
    await wait(200);
  },
};
