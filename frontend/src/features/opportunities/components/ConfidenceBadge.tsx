import { cn } from "@/shared/utils/cn";
import type { ConfidenceLevel } from "@/features/opportunities/types/opportunities";

const CONFIDENCE_STYLES: Record<
  ConfidenceLevel,
  string
> = {
  high: "border border-[#008241] bg-[#00AD5714] text-[#008241]",
  medium: "border border-[#9A7202] bg-[#FFF8E6] text-[#9A7202]",
  low: "border border-[#7A7F9A] bg-[#F4F4F8] text-[#7A7F9A]",
};

type ConfidenceBadgeProps = {
  confidence: ConfidenceLevel;
};

export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const label =
    confidence === "high"
      ? "HIGH CONFIDENCE"
      : confidence === "medium"
        ? "MEDIUM CONFIDENCE"
        : "LOW CONFIDENCE";

  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-[10px] font-semibold tracking-wide uppercase",
        CONFIDENCE_STYLES[confidence],
      )}
    >
      {label}
    </span>
  );
}
