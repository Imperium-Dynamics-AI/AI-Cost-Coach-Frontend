import type {
  ModelAlternative,
  PlannerFormState,
  PlannerReviewRow,
  PlannerWizardContent,
} from "@/features/planner/types/planner";

function formatModelName(modelId: string, models: PlannerWizardContent["models"]): string {
  const model = models.find((item) => item.id === modelId);
  if (!model) {
    return "GPT- 4.o mini";
  }

  if (model.name === "GPT-4o mini") {
    return "GPT- 4.o mini";
  }

  return model.name.replace("GPT-4o", "GPT- 4.o");
}

function formatGrowthRate(form: PlannerFormState): string {
  if (form.monthlyGrowthPreset === "short") {
    return "5% per month";
  }

  if (form.monthlyGrowthPreset === "long") {
    return "20% per month";
  }

  return "10% per month";
}

export function buildPlannerReviewRows(
  form: PlannerFormState,
  content: PlannerWizardContent,
): PlannerReviewRow[] {
  const documentsIncluded = form.useBusinessDocuments;

  return [
    {
      id: "ai-model",
      label: "AI Model",
      value: formatModelName(form.modelId, content.models),
      editStep: 1,
    },
    {
      id: "business-documents",
      label: "Business documents",
      value: documentsIncluded ? "Included" : "Not included",
      editStep: 2,
    },
    {
      id: "active-people",
      label: "Active people",
      value: String(form.activePeople),
      editStep: 3,
    },
    {
      id: "daily-interactions",
      label: "Daily interactions",
      value: `${form.interactionsPerDay} per persons`,
      editStep: 3,
    },
    {
      id: "average-input",
      label: "Average input",
      value: `${form.customInputTokens} tokens`,
      editStep: 4,
    },
    {
      id: "average-response",
      label: "Average response",
      value: `${form.customOutputTokens} tokens`,
      editStep: 4,
    },
    {
      id: "rag-context",
      label: "RAG Document context",
      value: documentsIncluded ? "Included" : "Not used",
      editStep: 2,
    },
    {
      id: "rag-storage",
      label: "RAG Document storage",
      value: documentsIncluded ? "Included" : "Not used",
      editStep: 2,
    },
    {
      id: "app-hosting",
      label: "App hosting",
      value: form.includeSupportingCosts ? "Included" : "Not included",
      editStep: 5,
    },
    {
      id: "expected-growth",
      label: "Expected growth",
      value: formatGrowthRate(form),
      editStep: 5,
    },
  ];
}

export function getSelectedModelHighlight(
  alternatives: ModelAlternative[],
  selectedModelId: string,
): {
  selected: ModelAlternative;
  lower: ModelAlternative;
  higher: ModelAlternative;
} {
  const selected =
    alternatives.find((item) => item.id === selectedModelId) ?? alternatives[0]!;
  const lower =
    alternatives.find((item) => item.tier === "lower") ?? alternatives[1] ?? selected;
  const higher =
    alternatives.find((item) => item.tier === "higher") ?? alternatives[2] ?? selected;

  return { selected, lower, higher };
}
