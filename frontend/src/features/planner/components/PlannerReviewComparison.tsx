import type {
  ModelAlternative,
  PlannerComparisonResult,
  PlannerEstimate,
} from "@/features/planner/types/planner";
import { cn } from "@/shared/utils/cn";

const SHELL_BOX_CLASS = "app-shell-box rounded-3xl px-5 py-6 md:px-8 md:py-8";

const INNER_BOX_CLASS =
  "rounded-2xl border border-[#8C52FB61] bg-[linear-gradient(180deg,rgba(217,217,217,0.2)_0%,rgba(140,82,251,0.022)_100%)]";

type PlannerReviewComparisonProps = {
  comparison: PlannerComparisonResult;
  estimate: PlannerEstimate;
  isCalculating: boolean;
};

export function PlannerReviewComparison({
  comparison,
  estimate,
  isCalculating,
}: PlannerReviewComparisonProps) {
  return (
    <>
      <section className={cn(SHELL_BOX_CLASS, "space-y-5")}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-[#19226880]">Selected</p>
            <h3 className="mt-1 text-2xl font-bold text-navy md:text-3xl">
              {estimate.selectionTitle}
            </h3>
            <p className="mt-1 text-sm text-[#19226880]">This is the model you selected.</p>
          </div>
          <span className="rounded-full border border-[#C9A227] bg-[#FFF8E6] px-3 py-1 text-[10px] font-bold tracking-wide text-[#9A7202] uppercase">
            Selected Model
          </span>
        </div>

        <div className={cn(INNER_BOX_CLASS, "px-5 py-5")}>
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
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-base font-bold text-navy md:text-lg">
            Estimated Monthly Cost
          </span>
          <span className="text-base font-bold text-[#8C52FB] md:text-lg">
            {isCalculating ? "..." : estimate.monthlyCost}
          </span>
        </div>

        <div className={cn(INNER_BOX_CLASS, "overflow-hidden")}>
          <div className="grid sm:grid-cols-2">
            <MetricCell
              label="Estimated Annual Cost"
              value={estimate.breakdown.annualCost}
              isCalculating={isCalculating}
              className="border-b border-r border-dashed border-[#8C52FB61]"
            />
            <MetricCell
              label="Cost Per Person"
              value={estimate.breakdown.costPerPerson}
              isCalculating={isCalculating}
              className="border-b border-dashed border-[#8C52FB61]"
            />
            <MetricCell
              label="Cost per AI Interaction"
              value={estimate.breakdown.costPerInteraction}
              isCalculating={isCalculating}
              className="border-r border-dashed border-[#8C52FB61]"
            />
            <MetricCell
              label="Next Month with 10% growth"
              value={estimate.breakdown.nextMonthGrowth}
              isCalculating={isCalculating}
            />
          </div>
        </div>
      </section>

      <section className={cn(SHELL_BOX_CLASS, "space-y-5")}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-[#19226880]">Nearest Priced Alternatives</p>
            <h3 className="mt-1 text-2xl font-bold text-navy md:text-3xl">
              Compare returned models
            </h3>
          </div>
          <span className="rounded-full border border-[#8C52FB61] bg-[#D9D9D933] px-3 py-1 text-xs font-semibold text-navy">
            75,000 interactions/month
          </span>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[760px] px-3">
            <div className="grid grid-cols-[minmax(160px,1.4fr)_repeat(6,minmax(88px,1fr))] gap-x-3 py-4 text-left text-sm font-semibold text-[#19226880]">
              <span>Model</span>
              <span>Monthly</span>
              <span>Difference</span>
              <span>Vs. Selected</span>
              <span>Annual</span>
              <span>Per Person</span>
              <span>Per interaction</span>
            </div>

            <div
              className="border-b border-dashed border-[#8C52FB61]"
              aria-hidden="true"
            />

            <div>
              {comparison.comparisonRows.map((row, index) => (
                <ComparisonRow
                  key={row.id}
                  row={row}
                  isLast={index === comparison.comparisonRows.length - 1}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function MetricCell({
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

function ComparisonRow({
  row,
  isLast,
}: {
  row: ModelAlternative;
  isLast: boolean;
}) {
  const isSelected = row.tier === "selected";
  const isCheaper = row.isCheaper;
  const isHigher = row.tier === "higher";

  return (
    <div>
      <div className="py-4">
        <div
          className={cn(
            "grid grid-cols-[minmax(160px,1.4fr)_repeat(6,minmax(88px,1fr))] items-center gap-x-3 text-sm",
            isCheaper && "rounded-2xl bg-[#00F43D1F] px-3 py-4",
          )}
        >
          <div>
            <p className="font-bold text-[#8C52FB]">{row.name}</p>
            <p className="mt-1 text-xs font-semibold text-navy">{row.description}</p>
          </div>
          <span className="font-semibold text-navy">{row.monthlyCost}</span>
          <span
            className={cn(
              "font-semibold",
              isSelected ? "text-navy" : isCheaper ? "text-[#008241]" : "text-red-600",
            )}
          >
            {row.difference}
          </span>
          <span
            className={cn(
              "font-semibold",
              isSelected ? "text-navy" : isHigher ? "text-red-600" : "text-navy",
            )}
          >
            {row.vsSelected}
          </span>
          <span className="text-navy">{row.annualCost}</span>
          <span className="text-navy">{row.costPerPerson}</span>
          <span className="text-navy">{row.costPerInteraction}</span>
        </div>
      </div>

      {!isLast ? (
        <div
          className="border-b border-dashed border-[#8C52FB61]"
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
}
