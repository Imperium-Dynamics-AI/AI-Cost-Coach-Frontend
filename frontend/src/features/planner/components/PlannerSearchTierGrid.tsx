import type { SearchTierOption } from "@/features/planner/types/planner";
import { cn } from "@/shared/utils/cn";

type PlannerSearchTierGridProps = {
  tiers: SearchTierOption[];
  selectedTierId: string;
  onSelect: (tierId: string) => void;
};

const CARD_CLASS =
  "border-[#8C52FB61] bg-[linear-gradient(180deg,rgba(217,217,217,0.2)_0%,rgba(140,82,251,0.022)_100%)]";

export function PlannerSearchTierGrid({
  tiers,
  selectedTierId,
  onSelect,
}: PlannerSearchTierGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {tiers.map((tier) => {
        const isSelected = tier.id === selectedTierId;

        return (
          <button
            key={tier.id}
            type="button"
            onClick={() => onSelect(tier.id)}
            className={cn(
              "cursor-pointer rounded-2xl border p-5 text-left transition",
              CARD_CLASS,
              isSelected ? "border-[#8C52FB] ring-1 ring-[#8C52FB61]" : "hover:border-[#8C52FB]",
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                  isSelected ? "border-[#8C52FB]" : "border-[#CFC5E8]",
                )}
              >
                {isSelected ? (
                  <span className="h-2 w-2 rounded-full bg-[#8C52FB]" />
                ) : null}
              </span>

              <div>
                <p className="text-base font-bold text-navy">{tier.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-[#8C52FB]">
                  {tier.description}
                </p>
                <p className="mt-3 text-sm font-medium text-navy">
                  {tier.monthlyCost}/month
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
