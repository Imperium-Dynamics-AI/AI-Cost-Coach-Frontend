type OpportunityStatProps = {
  label: string;
  value: string;
};

export function OpportunityStat({ label, value }: OpportunityStatProps) {
  return (
    <div>
      <p className="text-sm text-navy">{label}</p>
      <p className="mt-1 text-base font-bold text-[#7013D4] md:text-lg">{value}</p>
    </div>
  );
}

type OpportunitySectionListProps = {
  title: string;
  items: string[];
};

export function OpportunitySectionList({
  title,
  items,
}: OpportunitySectionListProps) {
  return (
    <section>
      <h4 className="text-base font-bold tracking-wide text-navy uppercase md:text-lg">
        {title}
      </h4>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[#19226880] marker:text-[#19226880]">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
