import { OPPORTUNITIES_CONFIG } from "@/features/opportunities/config/opportunitiesConfig";
import type {
  OpportunitiesApi,
  OpportunitiesOverview,
} from "@/features/opportunities/types/opportunities";

export const httpOpportunitiesApi: OpportunitiesApi = {
  async getOverview(): Promise<OpportunitiesOverview> {
    const response = await fetch(
      `${OPPORTUNITIES_CONFIG.apiBaseUrl}${OPPORTUNITIES_CONFIG.endpoints.overview}`,
    );
    if (!response.ok) {
      throw new Error("Unable to load opportunities.");
    }
    return response.json() as Promise<OpportunitiesOverview>;
  },

  async snoozeRecommendation(id: string): Promise<void> {
    const response = await fetch(
      `${OPPORTUNITIES_CONFIG.apiBaseUrl}${OPPORTUNITIES_CONFIG.endpoints.snooze}/${id}/snooze`,
      { method: "POST" },
    );
    if (!response.ok) {
      throw new Error("Unable to snooze recommendation.");
    }
  },

  async dismissRecommendation(id: string): Promise<void> {
    const response = await fetch(
      `${OPPORTUNITIES_CONFIG.apiBaseUrl}${OPPORTUNITIES_CONFIG.endpoints.dismiss}/${id}/dismiss`,
      { method: "POST" },
    );
    if (!response.ok) {
      throw new Error("Unable to dismiss recommendation.");
    }
  },

  async acceptRecommendation(id: string): Promise<void> {
    const response = await fetch(
      `${OPPORTUNITIES_CONFIG.apiBaseUrl}${OPPORTUNITIES_CONFIG.endpoints.accept}/${id}/accept`,
      { method: "POST" },
    );
    if (!response.ok) {
      throw new Error("Unable to accept recommendation.");
    }
  },
};
