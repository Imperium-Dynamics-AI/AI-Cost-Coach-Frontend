"use client";

import type {
  PlannerFormState,
  PlannerStepMeta,
  PlannerWizardContent,
} from "@/features/planner/types/planner";
import { PlannerChoiceCards } from "@/features/planner/components/PlannerChoiceCards";
import { PlannerHostingFields } from "@/features/planner/components/PlannerHostingFields";
import { PlannerModelGrid } from "@/features/planner/components/PlannerModelGrid";
import { PlannerTokenFields } from "@/features/planner/components/PlannerTokenFields";
import { PlannerUsageFields } from "@/features/planner/components/PlannerUsageFields";

type PlannerStepContentProps = {
  stepMeta: PlannerStepMeta;
  content: PlannerWizardContent;
  form: PlannerFormState;
  onUpdate: (patch: Partial<PlannerFormState>) => void;
};

export function PlannerStepContent({
  stepMeta,
  content,
  form,
  onUpdate,
}: PlannerStepContentProps) {
  switch (stepMeta.step) {
    case 1:
      return (
        <PlannerModelGrid
          models={content.models}
          selectedModelId={form.modelId}
          onSelect={(modelId) => onUpdate({ modelId })}
        />
      );

    case 2:
      return (
        <PlannerChoiceCards
          options={content.businessDocumentChoices}
          selectedId={form.useBusinessDocuments ? "yes" : "no"}
          onSelect={(id) => onUpdate({ useBusinessDocuments: id === "yes" })}
        />
      );

    case 3:
      return <PlannerUsageFields form={form} onUpdate={onUpdate} />;

    case 4:
      return <PlannerTokenFields content={content} form={form} onUpdate={onUpdate} />;

    case 5:
      return <PlannerHostingFields content={content} form={form} onUpdate={onUpdate} />;

    default:
      return null;
  }
}
