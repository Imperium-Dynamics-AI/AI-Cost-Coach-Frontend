import { PLANNER_CONFIG } from "@/features/planner/config/plannerConfig";
import type {
  PlannerApi,
  PlannerComparisonResult,
  PlannerEstimate,
  PlannerFormState,
  PlannerWizardContent,
} from "@/features/planner/types/planner";

export const httpPlannerApi: PlannerApi = {
  async getWizardContent(): Promise<PlannerWizardContent> {
    const response = await fetch(
      `${PLANNER_CONFIG.apiBaseUrl}${PLANNER_CONFIG.endpoints.content}`,
    );
    if (!response.ok) {
      throw new Error("Unable to load planner content.");
    }
    return response.json() as Promise<PlannerWizardContent>;
  },

  async calculateEstimate(form: PlannerFormState): Promise<PlannerEstimate> {
    const response = await fetch(
      `${PLANNER_CONFIG.apiBaseUrl}${PLANNER_CONFIG.endpoints.estimate}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      },
    );
    if (!response.ok) {
      throw new Error("Unable to calculate estimate.");
    }
    return response.json() as Promise<PlannerEstimate>;
  },

  async getComparison(form: PlannerFormState): Promise<PlannerComparisonResult> {
    const response = await fetch(
      `${PLANNER_CONFIG.apiBaseUrl}/api/v1/planner/comparison`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      },
    );
    if (!response.ok) {
      throw new Error("Unable to load model comparison.");
    }
    return response.json() as Promise<PlannerComparisonResult>;
  },
};
