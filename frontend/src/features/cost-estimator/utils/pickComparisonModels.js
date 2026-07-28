import { calculateLocalEstimate } from "./calculateLocalEstimate.js";

// Ranks every fully-priced catalog model by cost for the exact usage
// entered so far, then returns the selected model plus its cheaper and
// pricier neighbor (whichever exist). Deterministic, no backend
// model-family logic — everything here is a number we already have.
export function pickComparisonModels(values, catalog) {
  const pricedModels = (catalog?.models ?? []).filter(
    (model) => Number.isFinite(model.inputPer1K) && Number.isFinite(model.outputPer1K),
  );

  const ranked = pricedModels
    .map((model) => {
      const estimate = calculateLocalEstimate(
        { ...values, openai: { ...values.openai, modelId: model.id } },
        catalog,
      );
      return { model, monthlyTotal: estimate?.scenario?.monthlyTotal ?? null };
    })
    .filter((entry) => entry.monthlyTotal !== null)
    .sort((a, b) => a.monthlyTotal - b.monthlyTotal);

  const selectedIndex = ranked.findIndex(
    (entry) => entry.model.id === values.openai.modelId,
  );
  if (selectedIndex === -1) {
    return null;
  }

  const comparisons = [
    {
      id: "selected",
      label: "Selected model",
      relationship: "selected",
      reason: "This is the model you selected.",
      model: ranked[selectedIndex].model,
    },
  ];

  if (selectedIndex > 0) {
    comparisons.push({
      id: "cheaper",
      label: "Lower-cost option",
      relationship: "cheaper",
      reason: "A lower-cost model for the exact same usage.",
      model: ranked[selectedIndex - 1].model,
    });
  }

  if (selectedIndex < ranked.length - 1) {
    comparisons.push({
      id: "pricier",
      label: "Higher-cost option",
      relationship: "more-expensive",
      reason: "A higher-cost model for the exact same usage.",
      model: ranked[selectedIndex + 1].model,
    });
  }

  return comparisons;
}
