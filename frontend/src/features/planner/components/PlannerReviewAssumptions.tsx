import type { PlannerReviewRow } from "@/features/planner/types/planner";
import { cn } from "@/shared/utils/cn";

const REVIEW_BOX_CLASS =
  "rounded-2xl border border-[#8C52FB61] bg-[linear-gradient(180deg,rgba(217,217,217,0.2)_0%,rgba(140,82,251,0.022)_100%)] px-5 py-2 md:px-6";

type PlannerReviewAssumptionsProps = {
  rows: PlannerReviewRow[];
  onEdit: (step: PlannerReviewRow["editStep"]) => void;
};

function EditIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

export function PlannerReviewAssumptions({ rows, onEdit }: PlannerReviewAssumptionsProps) {
  return (
    <section className={REVIEW_BOX_CLASS}>
      {rows.map((row, index) => (
        <div
          key={row.id}
          className={cn(
            "flex flex-wrap items-center gap-3 py-4",
            index < rows.length - 1 ? "border-b border-dashed border-[#8C52FB61]" : "",
          )}
        >
          <span className="min-w-[140px] flex-1 text-sm font-medium text-navy md:text-base">
            {row.label}
          </span>
          <span className="flex-1 text-center text-sm font-semibold text-[#8C52FB] md:text-base">
            {row.value}
          </span>
          <button
            type="button"
            onClick={() => onEdit(row.editStep)}
            aria-label={`Edit ${row.label}`}
            className="ml-auto cursor-pointer text-navy transition hover:opacity-70"
          >
            <EditIcon />
          </button>
        </div>
      ))}
    </section>
  );
}
