"use client";

import { useCallback, useEffect, useState } from "react";
import { aiCoachApi } from "@/features/ai-coach/api";
import { getErrorMessage } from "@/features/auth/api/errors";
import type { ChatMessage } from "@/features/ai-coach/types/aiCoach";

export function useAiCoachChat() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const session = await aiCoachApi.getSession();
        if (cancelled) {
          return;
        }
        setSessionId(session.id);
        setMessages(session.messages);
        setError(null);
      } catch (caught) {
        if (cancelled) {
          return;
        }
        setError(getErrorMessage(caught, "Unable to load AI Coach chat."));
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || !sessionId || isSending) {
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const result = await aiCoachApi.sendMessage(sessionId, trimmed);
      setMessages((current) => [
        ...current,
        result.userMessage,
        result.assistantMessage,
      ]);
      setInput("");
    } catch (caught) {
      setError(getErrorMessage(caught, "Unable to send message."));
    } finally {
      setIsSending(false);
    }
  }, [input, isSending, sessionId]);

  return {
    messages,
    input,
    isLoading,
    isSending,
    error,
    setInput,
    sendMessage,
  };
}
