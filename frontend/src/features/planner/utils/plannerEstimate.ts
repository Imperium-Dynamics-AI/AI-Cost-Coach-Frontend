import {
  AI_MODELS,
  DEFAULT_PLANNER_FORM,
} from "@/features/planner/data/plannerDummyData";
import type {
  PlannerEstimate,
  PlannerFormState,
  PlannerWizardContent,
} from "@/features/planner/types/planner";

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

function formatModelTitle(modelId: string): string {
  const model = AI_MODELS.find((item) => item.id === modelId);
  if (!model) {
    return "GPT- 4.o mini";
  }

  if (model.name === "GPT-4o mini") {
    return "GPT- 4.o mini";
  }

  if (model.name === "GPT-4o") {
    return "GPT- 4.o";
  }

  return model.name;
}

export function calculateMonthlyInteractions(form: PlannerFormState): number {
  return form.activePeople * form.interactionsPerDay * 30;
}

export function buildPlannerEstimate(
  form: PlannerFormState,
  _content?: PlannerWizardContent,
): PlannerEstimate {
  const monthlyInteractions = calculateMonthlyInteractions(form);
  let selectionTitle = formatModelTitle(form.modelId);

  if (form.useBusinessDocuments) {
    selectionTitle += " + your content";
  }

  const lineItems: PlannerEstimate["lineItems"] = [
    {
      label: "Estimated Usage",
      amount: `${monthlyInteractions.toLocaleString()} AI interactions/month`,
      isUsage: true,
    },
    {
      label: "AI Model usage",
      amount: formatCurrency(29.7),
    },
  ];

  if (form.useBusinessDocuments) {
    lineItems.push(
      {
        label: "AI Document Search",
        amount: formatCurrency(29.7),
      },
      {
        label: "Source Document Storage",
        amount: formatCurrency(29.7),
      },
    );
  }

  return {
    selectionTitle,
    lineItems,
    monthlyCost: formatCurrency(29.7),
    breakdown: {
      annualCost: formatCurrency(635.11),
      costPerPerson: formatCurrency(635.11),
      costPerInteraction: formatCurrency(635.11),
      nextMonthGrowth: formatCurrency(635.11),
    },
  };
}

export function mergePlannerForm(
  saved: Partial<PlannerFormState> | null | undefined,
): PlannerFormState {
  return {
    ...DEFAULT_PLANNER_FORM,
    ...saved,
  };
}
