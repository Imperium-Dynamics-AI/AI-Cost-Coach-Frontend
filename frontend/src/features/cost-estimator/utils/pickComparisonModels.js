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
      // Infrastructure is identical for every scenario, so it must not block
      // model ranking when one of those shared rates is temporarily missing.
      // The backend can still return a null final total for unavailable rates.
      return {
        model,
        monthlyModelCost: estimate?.scenario?.breakdown?.openai ?? null,
      };
    })
    .filter((entry) => Number.isFinite(entry.monthlyModelCost))
    .sort(
      (a, b) =>
        a.monthlyModelCost - b.monthlyModelCost ||
        a.model.id.localeCompare(b.model.id),
    );

  const selectedIndex = ranked.findIndex(
    (entry) => entry.model.id === values.openai.modelId,
  );
  if (selectedIndex === -1) {
    return null;
  }

  const selectedCost = ranked[selectedIndex].monthlyModelCost;
  let cheaperModel = null;
  let pricierModel = null;

  // Skip equal-cost entries so an alternative is never described as
  // cheaper/pricier when the calculated cents are actually the same.
  for (let index = selectedIndex - 1; index >= 0; index -= 1) {
    if (ranked[index].monthlyModelCost < selectedCost) {
      cheaperModel = ranked[index].model;
      break;
    }
  }

  for (let index = selectedIndex + 1; index < ranked.length; index += 1) {
    if (ranked[index].monthlyModelCost > selectedCost) {
      pricierModel = ranked[index].model;
      break;
    }
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

  if (cheaperModel) {
    comparisons.push({
      id: "cheaper",
      label: "Lower-cost option",
      relationship: "cheaper",
      reason: "A lower-cost model for the exact same usage.",
      model: cheaperModel,
    });
  }

  if (pricierModel) {
    comparisons.push({
      id: "pricier",
      label: "Higher-cost option",
      relationship: "more-expensive",
      reason: "A higher-cost model for the exact same usage.",
      model: pricierModel,
    });
  }

  return comparisons;
}
