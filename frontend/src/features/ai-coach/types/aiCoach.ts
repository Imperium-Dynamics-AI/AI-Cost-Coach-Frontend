export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
};

export type AiCoachSession = {
  id: string;
  messages: ChatMessage[];
};

export type SendMessageResult = {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
};

export interface AiCoachApi {
  getSession(): Promise<AiCoachSession>;
  sendMessage(sessionId: string, message: string): Promise<SendMessageResult>;
}
