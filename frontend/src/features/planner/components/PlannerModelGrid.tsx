import type { AiModelOption } from "@/features/planner/types/planner";
import { cn } from "@/shared/utils/cn";

type PlannerModelGridProps = {
  models: AiModelOption[];
  selectedModelId: string;
  onSelect: (modelId: string) => void;
};

export function PlannerModelGrid({
  models,
  selectedModelId,
  onSelect,
}: PlannerModelGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {models.map((model) => {
        const isSelected = model.id === selectedModelId;

        return (
          <button
            key={model.id}
            type="button"
            onClick={() => onSelect(model.id)}
            className={cn(
              "cursor-pointer rounded-2xl border p-4 text-left transition",
              "border-[#8C52FB61] bg-[linear-gradient(180deg,rgba(217,217,217,0.2)_0%,rgba(140,82,251,0.022)_100%)]",
              isSelected ? "border-[#8C52FB] ring-1 ring-[#8C52FB61]" : "hover:border-[#8C52FB]",
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                  isSelected ? "border-[#8C52FB]" : "border-[#CFC5E8]",
                )}
              >
                {isSelected ? (
                  <span className="h-2 w-2 rounded-full bg-[#8C52FB]" />
                ) : null}
              </span>

              <div className="min-w-0">
                <p className="text-base font-bold text-navy">{model.name}</p>
                <p className="mt-2 text-sm leading-relaxed text-[#8C52FB]">
                  {model.description}
                </p>
                <p className="mt-3 text-sm font-medium text-navy">
                  {model.inputPrice} input . {model.outputPrice} output per 1k tokens
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
