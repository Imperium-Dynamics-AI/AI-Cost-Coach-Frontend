import { AiCoachInputBar } from "@/features/ai-coach/components/AiCoachInputBar";
import { AiCoachMessageList } from "@/features/ai-coach/components/AiCoachMessageList";
import type { ChatMessage } from "@/features/ai-coach/types/aiCoach";

type AiCoachChatPanelProps = {
  messages: ChatMessage[];
  input: string;
  isSending: boolean;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
};

export function AiCoachChatPanel({
  messages,
  input,
  isSending,
  onInputChange,
  onSubmit,
}: AiCoachChatPanelProps) {
  return (
    <section className="flex min-h-[560px] flex-col overflow-hidden rounded-2xl border border-[#E4D7F7] bg-white">
      <AiCoachMessageList messages={messages} isSending={isSending} />
      <AiCoachInputBar
        value={input}
        isSending={isSending}
        onChange={onInputChange}
        onSubmit={onSubmit}
      />
    </section>
  );
}
