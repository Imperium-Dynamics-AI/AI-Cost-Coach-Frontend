import type { PlannerStepMeta } from "@/features/planner/types/planner";

type PlannerStepHeadingProps = {
  stepMeta: PlannerStepMeta;
};

export function PlannerStepHeading({ stepMeta }: PlannerStepHeadingProps) {
  return (
    <div>
      <p className="text-sm font-bold text-[#19226880]">{stepMeta.eyebrow}</p>
      <h2 className="mt-1 text-xl font-bold text-navy md:text-2xl">{stepMeta.title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-navy md:text-base">
        {stepMeta.description}
      </p>
    </div>
  );
}
