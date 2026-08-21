import type { TokenPreset, TokenPresetOption } from "@/features/planner/types/planner";
import { cn } from "@/shared/utils/cn";

export const PLANNER_INPUT_BOX_CLASS =
  "rounded-full border border-[#8C52FB7A] bg-[#D9D9D933] px-5 py-3";

type PlannerPresetToggleProps = {
  presets: TokenPresetOption[];
  selectedPreset: TokenPreset;
  onSelect: (preset: TokenPreset) => void;
};

export function PlannerPresetToggle({
  presets,
  selectedPreset,
  onSelect,
}: PlannerPresetToggleProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {presets.map((preset) => {
        const isSelected = preset.id === selectedPreset;

        return (
          <button
            key={preset.id}
            type="button"
            onClick={() => onSelect(preset.id)}
            className={cn(
              "cursor-pointer rounded-lg border border-[#8C52FB7A] px-5 py-2.5 text-sm font-semibold text-navy transition",
              isSelected ? "bg-[#8C52FB54]" : "bg-[#D9D9D933]",
            )}
          >
            {preset.label} {preset.value.toLocaleString()}
          </button>
        );
      })}
    </div>
  );
}

type PlannerNumberFieldProps = {
  label: string;
  value: number;
  suffix: string;
  onChange: (value: number) => void;
};

export function PlannerNumberField({
  label,
  value,
  suffix,
  onChange,
}: PlannerNumberFieldProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-navy">{label}</p>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="number"
          min={0}
          value={value}
          onChange={(event) => onChange(Number(event.target.value) || 0)}
          className={cn(
            "w-full max-w-[220px] text-sm text-navy outline-none focus:border-[#8C52FB]",
            PLANNER_INPUT_BOX_CLASS,
          )}
        />
        <span className="text-sm text-[#19226880]">{suffix}</span>
      </div>
    </div>
  );
}
