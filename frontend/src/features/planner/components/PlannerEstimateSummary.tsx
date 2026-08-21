import type { PlannerEstimate } from "@/features/planner/types/planner";
import { cn } from "@/shared/utils/cn";

type PlannerEstimateSummaryProps = {
  estimate: PlannerEstimate;
  isCalculating: boolean;
};

const INNER_ESTIMATE_BOX_CLASS =
  "rounded-2xl border border-[#8C52FB61] bg-[linear-gradient(180deg,rgba(217,217,217,0.2)_0%,rgba(140,82,251,0.022)_100%)] px-5 py-5 md:px-6 md:py-6";

export function PlannerEstimateSummary({
  estimate,
  isCalculating,
}: PlannerEstimateSummaryProps) {
  return (
    <section className="app-shell-box space-y-6 rounded-3xl px-5 py-6 md:px-8 md:py-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#19226880]">Your Current Selection</p>
          <h3 className="mt-1 text-2xl font-bold text-navy md:text-3xl">
            {estimate.selectionTitle}
          </h3>
        </div>
        <span className="rounded-full border border-[#C9A227] bg-[#FFF8E6] px-3 py-1 text-[10px] font-bold tracking-wide text-[#9A7202] uppercase">
          Live Estimate
        </span>
      </div>

      <section className={INNER_ESTIMATE_BOX_CLASS}>
        <div className="space-y-4">
          {estimate.lineItems.map((item) => (
            <div
              key={item.label}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-[#8C52FB61] pb-4 last:border-b-0 last:pb-0"
            >
              <span className="text-base font-bold text-[#8C52FB] md:text-lg">
                {item.label}
              </span>
              <span className="text-sm font-semibold text-navy md:text-base">
                {item.amount}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-base font-bold text-navy md:text-lg">
          Estimated Monthly Cost
        </span>
        <span className="text-base font-bold text-[#8C52FB] md:text-lg">
          {isCalculating ? "..." : estimate.monthlyCost}
        </span>
      </div>

      <section className={INNER_ESTIMATE_BOX_CLASS}>
        <div className="grid sm:grid-cols-2">
          <EstimateMetric
            label="Estimated Annual Cost"
            value={estimate.breakdown.annualCost}
            isCalculating={isCalculating}
            className="border-b border-r border-dashed border-[#8C52FB61]"
          />
          <EstimateMetric
            label="Cost Per Person"
            value={estimate.breakdown.costPerPerson}
            isCalculating={isCalculating}
            className="border-b border-dashed border-[#8C52FB61]"
          />
          <EstimateMetric
            label="Cost per AI Interaction"
            value={estimate.breakdown.costPerInteraction}
            isCalculating={isCalculating}
            className="border-r border-dashed border-[#8C52FB61]"
          />
          <EstimateMetric
            label="Next Month with 10% growth"
            value={estimate.breakdown.nextMonthGrowth}
            isCalculating={isCalculating}
          />
        </div>
      </section>
    </section>
  );
}

function EstimateMetric({
  label,
  value,
  isCalculating,
  className = "",
}: {
  label: string;
  value: string;
  isCalculating: boolean;
  className?: string;
}) {
  return (
    <div className={cn("px-4 py-4 md:px-5", className)}>
      <p className="text-base font-bold text-[#8C52FB] md:text-lg">{label}</p>
      <p className="mt-1 text-base font-medium text-navy md:text-lg">
        {isCalculating ? "..." : value}
      </p>
    </div>
  );
}
