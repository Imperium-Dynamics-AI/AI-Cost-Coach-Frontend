import type { AiCoachSession } from "@/features/ai-coach/types/aiCoach";

export const AI_COACH_SESSION: AiCoachSession = {
  id: "session-default",
  messages: [
    {
      id: "msg-1",
      role: "user",
      content: "Can I ask the system about my Azure environment?",
      createdAt: "2026-08-21T12:00:00.000Z",
    },
    {
      id: "msg-2",
      role: "assistant",
      content:
        "Responses below are canned for now. Once live AI is connected, I will answer grounded questions about your Azure subscriptions, resource groups, and spend trends.",
      createdAt: "2026-08-21T12:00:05.000Z",
    },
  ],
};

export const ASSISTANT_REPLIES = [
  "I can help with that. Once live AI is connected, I will analyze your Azure subscriptions, resource groups, and spend trends to answer grounded questions like this.",
  "Based on the current dummy data, your environment shows elevated spend in Azure OpenAI and compute workloads. I can break that down by subscription when the backend is connected.",
  "That is a good question. For now, this chat uses canned responses, but the UI is ready for live Azure-grounded answers.",
  "I would recommend reviewing the Opportunities screen for prioritized savings recommendations while we connect the live AI coach backend.",
];
