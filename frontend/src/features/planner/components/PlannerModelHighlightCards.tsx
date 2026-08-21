import type { PlannerComparisonResult } from "@/features/planner/types/planner";
import { getSelectedModelHighlight } from "@/features/planner/utils/plannerReview";

type PlannerModelHighlightCardsProps = {
  comparison: PlannerComparisonResult;
  selectedModelId: string;
};

export function PlannerModelHighlightCards({
  comparison,
  selectedModelId,
}: PlannerModelHighlightCardsProps) {
  const { selected, lower, higher } = getSelectedModelHighlight(
    comparison.alternatives,
    selectedModelId,
  );

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <ModelHighlightCard
        eyebrow="Selected Mode"
        title={selected.name}
        description="This is the model you selected."
        highlighted
      />
      <ModelHighlightCard
        eyebrow="Lower Cost Option"
        title={lower.name}
        description="A lower cost model for the exact same usage"
      />
      <ModelHighlightCard
        eyebrow="Higher Cost Option"
        title={higher.name}
        description="A higher cost model for the exact same usage"
      />
    </div>
  );
}

function ModelHighlightCard({
  eyebrow,
  title,
  description,
  highlighted = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  highlighted?: boolean;
}) {
  return (
    <article
      className="rounded-2xl px-5 py-5 md:px-6 md:py-6"
      style={
        highlighted
          ? {
              background:
                "linear-gradient(180deg, #D9D9D9 0%, rgba(140, 82, 251, 0.11) 100%)",
              border: "1px solid #8C52FB",
            }
          : {
              background:
                "linear-gradient(180deg, rgba(217, 217, 217, 0.2) 0%, rgba(140, 82, 251, 0.022) 100%)",
              border: "1px solid #8C52FB1A",
            }
      }
    >
      <p className="text-sm font-extrabold tracking-wide text-navy uppercase md:text-base">
        {eyebrow}
      </p>
      <h4 className="mt-2 text-xl font-bold text-[#8C52FB] md:text-2xl">{title}</h4>
      <p className="mt-2 text-sm font-medium text-navy">{description}</p>
    </article>
  );
}
