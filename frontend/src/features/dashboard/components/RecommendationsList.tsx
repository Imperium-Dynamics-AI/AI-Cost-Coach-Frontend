import Link from "next/link";
import type { Recommendation } from "@/features/dashboard/types/dashboard";
import { cn } from "@/shared/utils/cn";

type RecommendationCardProps = {
  item: Recommendation;
};

const CONFIDENCE_STYLES = {
  high: "border border-[#008241] bg-[#00AD5714] text-[#008241]",
  medium: "border border-[#9A7202] bg-[#FFF8E6] text-[#9A7202]",
} as const;

export function RecommendationCard({ item }: RecommendationCardProps) {
  return (
    <article className="app-box rounded-2xl px-5 py-5 md:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-3xl">
          <h4 className="text-xl font-bold text-[#5F01C3]">{item.title}</h4>
          <p className="mt-2 text-base leading-relaxed text-navy">
            {item.description}
          </p>
        </div>
        <span
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-semibold tracking-wide uppercase",
            CONFIDENCE_STYLES[item.confidence],
          )}
        >
          {item.confidence === "high" ? "HIGH CONFIDENCE" : "MEDIUM CONFIDENCE"}
        </span>
      </div>

      <div className="mt-6 grid max-w-3xl grid-cols-3 gap-4">
        <div>
          <p className="text-base text-navy">Current</p>
          <p className="mt-1 font-semibold text-[#7013D4]">{item.currentLabel}</p>
        </div>
        <div>
          <p className="text-base text-navy">Projected</p>
          <p className="mt-1 font-semibold text-[#7013D4]">{item.projectedLabel}</p>
        </div>
        <div>
          <p className="text-base text-navy">Savings</p>
          <p className="mt-1 font-semibold text-[#7013D4]">{item.savingsLabel}</p>
        </div>
      </div>

      <Link
        href={item.href}
        className="mt-5 inline-flex text-base font-bold text-[#983DFA] underline underline-offset-4"
      >
        View recommendations →
      </Link>
    </article>
  );
}

type RecommendationsListProps = {
  items: Recommendation[];
};

export function RecommendationsList({ items }: RecommendationsListProps) {
  return (
    <section>
      <h3 className="text-3xl font-bold text-navy">Top Recommendations</h3>
      <div className="mt-4 space-y-4">
        {items.map((item) => (
          <RecommendationCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
