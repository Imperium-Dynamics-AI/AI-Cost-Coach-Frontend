import type { KpiCardData } from "@/features/dashboard/types/dashboard";

type KpiCardProps = {
  item: KpiCardData;
};

export function KpiCard({ item }: KpiCardProps) {
  return (
    <article className="app-box rounded-2xl px-5 py-5">
      <p className="text-base font-bold text-navy">{item.label}</p>
      <p className="mt-3 text-4xl font-bold text-[#8C52FB]">{item.value}</p>
      {item.hint ? (
        <p className="mt-2 text-sm text-navy">{item.hint}</p>
      ) : (
        <div className="mt-2 h-4" />
      )}
    </article>
  );
}

type KpiGridProps = {
  items: KpiCardData[];
};

export function KpiGrid({ items }: KpiGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <KpiCard key={item.id} item={item} />
      ))}
    </div>
  );
}
