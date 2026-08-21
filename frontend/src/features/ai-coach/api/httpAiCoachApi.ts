import { AI_COACH_CONFIG } from "@/features/ai-coach/config/aiCoachConfig";
import type {
  AiCoachApi,
  AiCoachSession,
  SendMessageResult,
} from "@/features/ai-coach/types/aiCoach";

export const httpAiCoachApi: AiCoachApi = {
  async getSession(): Promise<AiCoachSession> {
    const response = await fetch(
      `${AI_COACH_CONFIG.apiBaseUrl}${AI_COACH_CONFIG.endpoints.session}`,
    );
    if (!response.ok) {
      throw new Error("Unable to load AI Coach session.");
    }
    return response.json() as Promise<AiCoachSession>;
  },

  async sendMessage(sessionId: string, message: string): Promise<SendMessageResult> {
    const response = await fetch(
      `${AI_COACH_CONFIG.apiBaseUrl}${AI_COACH_CONFIG.endpoints.messages}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message }),
      },
    );
    if (!response.ok) {
      throw new Error("Unable to send message.");
    }
    return response.json() as Promise<SendMessageResult>;
  },
};
