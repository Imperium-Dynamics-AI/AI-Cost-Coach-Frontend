import { SendIcon } from "@/features/ai-coach/components/AiCoachIcons";

type AiCoachInputBarProps = {
  value: string;
  isSending: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export function AiCoachInputBar({
  value,
  isSending,
  onChange,
  onSubmit,
}: AiCoachInputBarProps) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-[#E4D7F7] bg-white px-4 py-4 md:px-6 md:py-5"
    >
      <div className="flex items-center gap-3 rounded-full border border-[#E4D7F7] bg-[#F3EAF7] py-2 pl-5 pr-2">
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Type a message here..."
          disabled={isSending}
          className="min-w-0 flex-1 bg-transparent text-sm text-navy outline-none placeholder:text-[#8C52FB80] md:text-base"
        />
        <button
          type="submit"
          disabled={isSending || !value.trim()}
          aria-label="Send message"
          className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#8C52FB] text-white transition hover:bg-[#7A45E8] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <SendIcon />
        </button>
      </div>
    </form>
  );
}
