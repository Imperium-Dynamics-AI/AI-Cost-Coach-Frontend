import { PlannerChoiceCards } from "@/features/planner/components/PlannerChoiceCards";
import {
  PLANNER_INPUT_BOX_CLASS,
  PlannerPresetToggle,
} from "@/features/planner/components/PlannerFormControls";
import type { PlannerFormState, PlannerWizardContent } from "@/features/planner/types/planner";
import { cn } from "@/shared/utils/cn";

type PlannerHostingFieldsProps = {
  content: PlannerWizardContent;
  form: PlannerFormState;
  onUpdate: (patch: Partial<PlannerFormState>) => void;
};

export function PlannerHostingFields({
  content,
  form,
  onUpdate,
}: PlannerHostingFieldsProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <p className="text-sm font-medium text-navy md:text-base">
          Should we include a small web to host the solution?
        </p>
        <PlannerChoiceCards
          options={content.supportingCostChoices}
          selectedId={form.includeSupportingCosts ? "yes" : "no"}
          onSelect={(id) => onUpdate({ includeSupportingCosts: id === "yes" })}
        />
      </div>

      <div className="space-y-4 border-t border-dashed border-[#8C52FB61] pt-6">
        <p className="text-sm font-medium text-navy md:text-base">
          How much do you expect usage to grow each month?
        </p>

        <PlannerPresetToggle
          presets={content.growthPresets}
          selectedPreset={form.monthlyGrowthPreset}
          onSelect={(monthlyGrowthPreset) => {
            const preset = content.growthPresets.find(
              (item) => item.id === monthlyGrowthPreset,
            );
            onUpdate({
              monthlyGrowthPreset,
              customGrowthValue: preset?.value ?? form.customGrowthValue,
            });
          }}
        />

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-medium text-navy md:text-base">Average input size</p>

          <div className="flex flex-wrap items-center gap-3">
            <div className={cn("flex min-w-[180px] items-center", PLANNER_INPUT_BOX_CLASS)}>
              <span className="mr-1 text-sm text-[#19226880]">/</span>
              <input
                type="number"
                min={0}
                value={form.customGrowthValue}
                onChange={(event) =>
                  onUpdate({ customGrowthValue: Number(event.target.value) || 0 })
                }
                className="w-full min-w-[60px] bg-transparent text-sm text-navy outline-none"
              />
            </div>
            <span className="text-sm font-medium text-[#8C52FB]">people</span>
          </div>
        </div>
      </div>
    </div>
  );
}
