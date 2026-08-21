import type { RankedSpendItem } from "@/features/dashboard/types/dashboard";
import { cn } from "@/shared/utils/cn";

type ResourceBarRowProps = {
  item: RankedSpendItem;
};

export function ResourceBarRow({ item }: ResourceBarRowProps) {
  return (
    <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1.6fr)_auto] items-center gap-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-base font-medium text-navy">{item.title}</p>
        {item.subtitle ? (
          <p className="truncate text-base font-bold text-[#5F01C3]">{item.subtitle}</p>
        ) : null}
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-[#8C52FB38]">
        <div
          className="h-full rounded-full bg-brand"
          style={{ width: `${item.percent}%` }}
        />
      </div>
      <p className="text-base text-navy">{item.amountLabel}</p>
    </div>
  );
}

type ResourceBarListProps = {
  eyebrow?: string;
  title: string;
  items: RankedSpendItem[];
  className?: string;
};

export function ResourceBarList({
  eyebrow = "Cost Overview",
  title,
  items,
  className,
}: ResourceBarListProps) {
  return (
    <section className={cn("app-box rounded-2xl px-5 py-5 md:px-6", className)}>
      <p className="text-base font-bold text-[#19226880]">{eyebrow}</p>
      <h3 className="mt-1 text-3xl font-bold text-navy">{title}</h3>
      <div className="mt-4 divide-y divide-[#EFEAF8]">
        {items.map((item) => (
          <ResourceBarRow key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
