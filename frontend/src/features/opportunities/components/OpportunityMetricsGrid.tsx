import type { OpportunityMetric } from "@/features/opportunities/types/opportunities";

type OpportunityMetricsGridProps = {
  items: OpportunityMetric[];
};

export function OpportunityMetricsGrid({ items }: OpportunityMetricsGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <article key={item.id} className="app-box rounded-2xl px-5 py-5 md:px-6">
          <p className="text-sm font-bold text-navy md:text-base">{item.label}</p>
          <p className="mt-3 text-3xl font-bold text-[#8C52FB] md:text-4xl">
            {item.value}
          </p>
          <p className="mt-2 text-sm text-navy">{item.hint}</p>
        </article>
      ))}
    </div>
  );
}
