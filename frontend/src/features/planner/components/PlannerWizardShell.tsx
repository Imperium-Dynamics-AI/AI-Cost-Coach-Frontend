import type { ReactNode } from "react";
import type { PlannerStepMeta } from "@/features/planner/types/planner";
import { PlannerStepHeading } from "@/features/planner/components/PlannerStepHeading";
import { PlannerStepper } from "@/features/planner/components/PlannerStepper";

type PlannerWizardShellProps = {
  stepMeta: PlannerStepMeta;
  currentStep: PlannerStepMeta["step"];
  children: ReactNode;
  actions: ReactNode;
};

export function PlannerWizardShell({
  stepMeta,
  currentStep,
  children,
  actions,
}: PlannerWizardShellProps) {
  return (
    <section className="space-y-6">
      <div className="flex justify-center py-6 md:py-8">
        <div className="w-full max-w-2xl">
          <PlannerStepper currentStep={currentStep} />
        </div>
      </div>

      <PlannerStepHeading stepMeta={stepMeta} />

      <div>{children}</div>

      <div>{actions}</div>
    </section>
  );
}
