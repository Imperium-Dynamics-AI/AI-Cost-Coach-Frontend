import {
  PLANNER_WIZARD_CONTENT,
  buildPlannerComparison,
} from "@/features/planner/data/plannerDummyData";
import type {
  PlannerApi,
  PlannerComparisonResult,
  PlannerEstimate,
  PlannerFormState,
  PlannerWizardContent,
} from "@/features/planner/types/planner";
import { buildPlannerEstimate } from "@/features/planner/utils/plannerEstimate";

function wait(ms = 250): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export const dummyPlannerApi: PlannerApi = {
  async getWizardContent(): Promise<PlannerWizardContent> {
    await wait();
    return structuredClone(PLANNER_WIZARD_CONTENT);
  },

  async calculateEstimate(form: PlannerFormState): Promise<PlannerEstimate> {
    await wait(150);
    return buildPlannerEstimate(form, PLANNER_WIZARD_CONTENT);
  },

  async getComparison(form: PlannerFormState): Promise<PlannerComparisonResult> {
    await wait(150);
    return buildPlannerComparison(form);
  },
};
