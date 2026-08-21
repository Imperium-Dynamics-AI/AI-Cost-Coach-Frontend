import { dummyAiCoachApi } from "@/features/ai-coach/api/dummyAiCoachApi";
import { httpAiCoachApi } from "@/features/ai-coach/api/httpAiCoachApi";
import { AI_COACH_CONFIG } from "@/features/ai-coach/config/aiCoachConfig";
import type { AiCoachApi } from "@/features/ai-coach/types/aiCoach";

export const aiCoachApi: AiCoachApi = AI_COACH_CONFIG.useMock
  ? dummyAiCoachApi
  : httpAiCoachApi;
