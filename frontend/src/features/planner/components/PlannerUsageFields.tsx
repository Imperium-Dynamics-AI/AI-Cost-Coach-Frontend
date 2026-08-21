import { PLANNER_INPUT_BOX_CLASS } from "@/features/planner/components/PlannerFormControls";
import { calculateMonthlyInteractions } from "@/features/planner/utils/plannerEstimate";
import type { PlannerFormState } from "@/features/planner/types/planner";
import { cn } from "@/shared/utils/cn";

type PlannerUsageFieldsProps = {
  form: PlannerFormState;
  onUpdate: (patch: Partial<PlannerFormState>) => void;
};

export function PlannerUsageFields({ form, onUpdate }: PlannerUsageFieldsProps) {
  return (
    <div className="space-y-0">
      <UsageRow
        label="How many active people should the estimate include?"
        value={form.activePeople}
        suffix="people"
        onChange={(activePeople) => onUpdate({ activePeople })}
      />

      <UsageRow
        label="How many AI interactions will each person have per day?"
        value={form.interactionsPerDay}
        suffix="interactions"
        prefix="/"
        onChange={(interactionsPerDay) => onUpdate({ interactionsPerDay })}
      />

      <p className="pt-6 text-sm text-navy md:text-base">
        About{" "}
        <span className="font-bold text-[#8C52FB]">
          {calculateMonthlyInteractions(form).toLocaleString()}
        </span>{" "}
        AI interactions per month
      </p>
    </div>
  );
}

function UsageRow({
  label,
  value,
  suffix,
  prefix,
  onChange,
}: {
  label: string;
  value: number;
  suffix: string;
  prefix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-dashed border-[#8C52FB61] py-5 first:pt-0 last:border-b-0 md:flex-row md:items-center md:justify-between">
      <p className="text-sm font-medium text-navy md:max-w-md md:text-base">{label}</p>

      <div className="flex flex-wrap items-center gap-3">
        <div className={cn("flex min-w-[180px] items-center", PLANNER_INPUT_BOX_CLASS)}>
          {prefix ? (
            <span className="mr-1 text-sm text-[#19226880]">{prefix}</span>
          ) : null}
          <input
            type="number"
            min={0}
            value={value}
            onChange={(event) => onChange(Number(event.target.value) || 0)}
            className="w-full min-w-[60px] bg-transparent text-sm text-navy outline-none"
          />
        </div>
        <span className="text-sm font-medium text-[#8C52FB]">{suffix}</span>
      </div>
    </div>
  );
}
