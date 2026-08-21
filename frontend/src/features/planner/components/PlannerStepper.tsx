import type { PlannerStep } from "@/features/planner/types/planner";
import { cn } from "@/shared/utils/cn";

type PlannerStepperProps = {
  currentStep: PlannerStep;
};

const STEPS: PlannerStep[] = [1, 2, 3, 4, 5, 6];

function CheckIcon() {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function PlannerStepper({ currentStep }: PlannerStepperProps) {
  return (
    <div className="overflow-x-auto pb-1">
      <ol className="mx-auto flex min-w-[520px] max-w-2xl items-center justify-center">
        {STEPS.map((step, index) => {
          const isComplete = step < currentStep;

          return (
            <li key={step} className="flex flex-1 items-center">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                  isComplete
                    ? "bg-[#8C52FB] text-white"
                    : "bg-[#8C52FB5C] text-white",
                )}
              >
                {isComplete ? <CheckIcon /> : step}
              </div>

              {index < STEPS.length - 1 ? (
                <div
                  className={cn(
                    "mx-2 h-px flex-1",
                    step < currentStep ? "bg-[#8C52FB]" : "bg-[#E4D7F7]",
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
