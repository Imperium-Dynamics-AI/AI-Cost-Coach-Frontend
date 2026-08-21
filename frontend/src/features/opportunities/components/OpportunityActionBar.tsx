import type { RecommendationAction } from "@/features/opportunities/types/opportunities";
import { cn } from "@/shared/utils/cn";

type OpportunityActionBarProps = {
  isSubmitting: boolean;
  activeAction: RecommendationAction;
  onSnooze: () => void;
  onDismiss: () => void;
  onAccept: () => void;
};

export function OpportunityActionBar({
  isSubmitting,
  activeAction,
  onSnooze,
  onDismiss,
  onAccept,
}: OpportunityActionBarProps) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
      <button
        type="button"
        onClick={onSnooze}
        disabled={isSubmitting || activeAction !== null}
        className={cn(
          "cursor-pointer rounded-full border-2 border-[#8C52FB61] bg-[#8C52FB] px-8 py-3.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60",
          activeAction === "snooze" && "opacity-90",
        )}
      >
        Snooze
      </button>

      <button
        type="button"
        onClick={onDismiss}
        disabled={isSubmitting || activeAction !== null}
        className={cn(
          "cursor-pointer rounded-full border-2 border-[#8C52FB61] bg-transparent px-8 py-3.5 text-sm font-semibold text-brand transition hover:bg-[#8C52FB14] disabled:cursor-not-allowed disabled:opacity-60",
          activeAction === "dismiss" && "bg-[#8C52FB14]",
        )}
      >
        Dismiss
      </button>

      <button
        type="button"
        onClick={onAccept}
        disabled={isSubmitting || activeAction !== null}
        className={cn(
          "min-w-0 cursor-pointer rounded-full border-[0.83px] border-[#8C52FB61] bg-[#8C52FB33] px-8 py-3.5 text-sm font-semibold text-navy transition hover:bg-[#8C52FB40] disabled:cursor-not-allowed disabled:opacity-60 sm:ml-auto sm:min-w-[280px] sm:flex-1 lg:min-w-[360px]",
          activeAction === "accept" && "bg-[#8C52FB40]",
        )}
      >
        Accept
      </button>
    </div>
  );
}
