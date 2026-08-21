"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/features/ai-coach/types/aiCoach";
import {
  AiCoachAvatarIcon,
  UserChatAvatarIcon,
} from "@/features/ai-coach/components/AiCoachIcons";
import { cn } from "@/shared/utils/cn";

type AiCoachMessageBubbleProps = {
  message: ChatMessage;
};

export function AiCoachMessageBubble({ message }: AiCoachMessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex items-end gap-3",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {!isUser ? <AiCoachAvatarIcon className="shrink-0" /> : null}

      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed md:max-w-[70%] md:text-base",
          isUser
            ? "bg-[#8C52FB] text-white"
            : "border border-[#E4D7F7] bg-[#F7FAFF] text-navy",
        )}
      >
        {message.content}
      </div>

      {isUser ? <UserChatAvatarIcon className="shrink-0" /> : null}
    </div>
  );
}

type AiCoachMessageListProps = {
  messages: ChatMessage[];
  isSending: boolean;
};

export function AiCoachMessageList({
  messages,
  isSending,
}: AiCoachMessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  return (
    <div className="flex min-h-[480px] flex-1 flex-col gap-5 overflow-y-auto bg-[#FBF8FF] px-4 py-5 md:px-6 md:py-6">
      {messages.map((message) => (
        <AiCoachMessageBubble key={message.id} message={message} />
      ))}

      {isSending ? (
        <div className="flex items-end gap-3">
          <AiCoachAvatarIcon className="shrink-0" />
          <div className="rounded-2xl border border-[#E4D7F7] bg-[#F7FAFF] px-4 py-3 text-sm text-navy/60">
            Thinking...
          </div>
        </div>
      ) : null}

      <div ref={endRef} />
    </div>
  );
}
