import {
  PLANNER_INPUT_BOX_CLASS,
  PlannerPresetToggle,
} from "@/features/planner/components/PlannerFormControls";
import type {
  PlannerFormState,
  PlannerWizardContent,
  TokenPreset,
} from "@/features/planner/types/planner";
import { cn } from "@/shared/utils/cn";

type PlannerTokenFieldsProps = {
  content: PlannerWizardContent;
  form: PlannerFormState;
  onUpdate: (patch: Partial<PlannerFormState>) => void;
};

export function PlannerTokenFields({ content, form, onUpdate }: PlannerTokenFieldsProps) {
  function selectInputPreset(inputTokenPreset: TokenPreset) {
    const preset = content.inputTokenPresets.find((item) => item.id === inputTokenPreset);
    onUpdate({
      inputTokenPreset,
      customInputTokens: preset?.value ?? form.customInputTokens,
    });
  }

  function selectOutputPreset(outputTokenPreset: TokenPreset) {
    const preset = content.outputTokenPresets.find((item) => item.id === outputTokenPreset);
    onUpdate({
      outputTokenPreset,
      customOutputTokens: preset?.value ?? form.customOutputTokens,
    });
  }

  return (
    <div className="space-y-0">
      <TokenSection
        title="Typical text sent to the AI"
        presets={content.inputTokenPresets}
        selectedPreset={form.inputTokenPreset}
        onSelectPreset={selectInputPreset}
        value={form.customInputTokens}
        onChange={(customInputTokens) => onUpdate({ customInputTokens })}
      />

      <TokenSection
        title="Type AI response length"
        presets={content.outputTokenPresets}
        selectedPreset={form.outputTokenPreset}
        onSelectPreset={selectOutputPreset}
        value={form.customOutputTokens}
        onChange={(customOutputTokens) => onUpdate({ customOutputTokens })}
        showTopBorder
      />
    </div>
  );
}

function TokenSection({
  title,
  presets,
  selectedPreset,
  onSelectPreset,
  value,
  onChange,
  showTopBorder = false,
}: {
  title: string;
  presets: PlannerWizardContent["inputTokenPresets"];
  selectedPreset: TokenPreset;
  onSelectPreset: (preset: TokenPreset) => void;
  value: number;
  onChange: (value: number) => void;
  showTopBorder?: boolean;
}) {
  return (
    <div
      className={[
        "space-y-4 py-5",
        showTopBorder ? "border-t border-dashed border-[#8C52FB61]" : "",
      ].join(" ")}
    >
      <p className="text-sm font-medium text-navy md:text-base">{title}</p>

      <PlannerPresetToggle
        presets={presets}
        selectedPreset={selectedPreset}
        onSelect={onSelectPreset}
      />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm font-medium text-navy md:text-base">Average input size</p>

        <div className="flex flex-wrap items-center gap-3">
          <div className={cn("flex min-w-[180px] items-center", PLANNER_INPUT_BOX_CLASS)}>
            <span className="mr-1 text-sm text-[#19226880]">/</span>
            <input
              type="number"
              min={0}
              value={value}
              onChange={(event) => onChange(Number(event.target.value) || 0)}
              className="w-full min-w-[60px] bg-transparent text-sm text-navy outline-none"
            />
          </div>
          <span className="text-sm font-medium text-[#8C52FB]">people</span>
        </div>
      </div>
    </div>
  );
}
