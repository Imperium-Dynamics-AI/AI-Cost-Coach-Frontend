"use client";

import { AiCoachChatPanel } from "@/features/ai-coach/components/AiCoachChatPanel";
import { useAiCoachChat } from "@/features/ai-coach/hooks/useAiCoachChat";

export function AiCoachView() {
  const {
    messages,
    input,
    isLoading,
    isSending,
    error,
    setInput,
    sendMessage,
  } = useAiCoachChat();

  if (isLoading && messages.length === 0) {
    return (
      <div className="app-shell-box rounded-3xl px-6 py-16 text-center text-purple">
        Loading AI Coach...
      </div>
    );
  }

  if (error && messages.length === 0) {
    return (
      <div className="app-shell-box rounded-3xl px-6 py-16 text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <section className="app-shell-box space-y-6 rounded-3xl px-5 py-6 md:px-8 md:py-8">
      <div>
        <p className="text-sm font-bold text-[#19226880]">Grounded Chat</p>
        <h1 className="mt-1 text-3xl font-bold text-navy md:text-4xl">AI Coach</h1>
        <p className="mt-2 text-base text-[#8C52FB] md:text-lg">
          Can I ask the system about my Azure environment?
        </p>
        <div className="mt-5 h-px bg-[#E4D7F7]" />
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <AiCoachChatPanel
        messages={messages}
        input={input}
        isSending={isSending}
        onInputChange={setInput}
        onSubmit={() => void sendMessage()}
      />
    </section>
  );
}
