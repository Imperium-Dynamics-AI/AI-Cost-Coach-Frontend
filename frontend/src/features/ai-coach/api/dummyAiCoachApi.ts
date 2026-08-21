import {
  AI_COACH_SESSION,
  ASSISTANT_REPLIES,
} from "@/features/ai-coach/data/aiCoachDummyData";
import type {
  AiCoachApi,
  AiCoachSession,
  ChatMessage,
  SendMessageResult,
} from "@/features/ai-coach/types/aiCoach";

function wait(ms = 350): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function createMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

let sessionState: AiCoachSession = structuredClone(AI_COACH_SESSION);

export const dummyAiCoachApi: AiCoachApi = {
  async getSession(): Promise<AiCoachSession> {
    await wait();
    return structuredClone(sessionState);
  },

  async sendMessage(_sessionId: string, message: string): Promise<SendMessageResult> {
    await wait(500);

    const trimmed = message.trim();
    const userMessage = createMessage("user", trimmed);
    const replyIndex = sessionState.messages.length % ASSISTANT_REPLIES.length;
    const assistantMessage = createMessage(
      "assistant",
      ASSISTANT_REPLIES[replyIndex] ?? ASSISTANT_REPLIES[0]!,
    );

    sessionState = {
      ...sessionState,
      messages: [...sessionState.messages, userMessage, assistantMessage],
    };

    return { userMessage, assistantMessage };
  },
};
