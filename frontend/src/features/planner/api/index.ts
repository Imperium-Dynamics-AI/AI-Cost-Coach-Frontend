import { dummyPlannerApi } from "@/features/planner/api/dummyPlannerApi";
import { httpPlannerApi } from "@/features/planner/api/httpPlannerApi";
import { PLANNER_CONFIG } from "@/features/planner/config/plannerConfig";
import type { PlannerApi } from "@/features/planner/types/planner";

export const plannerApi: PlannerApi = PLANNER_CONFIG.useMock
  ? dummyPlannerApi
  : httpPlannerApi;
