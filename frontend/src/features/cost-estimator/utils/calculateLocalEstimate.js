const DAYS_PER_MONTH = 30;
const HOURS_PER_MONTH = 730;

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function readRate(value) {
  return Number.isFinite(value) ? value : null;
}

function calculateAnnualTotal(monthlyTotal, growthRate) {
  let annualTotal = 0;

  for (let month = 0; month < 12; month += 1) {
    annualTotal += monthlyTotal * (1 + growthRate) ** month;
  }

  return round(annualTotal);
}

function missingPriceWarning(label) {
  return `${label} pricing is unavailable, so the live total cannot be completed.`;
}

export function calculateLocalEstimate(values, catalog) {
  const model = catalog?.models?.find(
    (catalogModel) => catalogModel.id === values.openai.modelId,
  );

  if (!model) {
    return null;
  }

  const users = values.openai.users;
  const requestsPerDay = values.openai.requestsPerDay;
  const promptTokens = values.openai.avgPromptTokens;
  const completionTokens = values.openai.avgCompletionTokens;
  const docTokens = values.rag.avgDocTokens;
  const storageGB = values.storage.docStorageGB;
  const growthPct = values.global.growthPct;

  const numericInputs = [
    users,
    requestsPerDay,
    promptTokens,
    completionTokens,
    docTokens,
    storageGB,
    growthPct,
  ];

  if (
    numericInputs.some((value) => !Number.isFinite(value) || value < 0) ||
    users < 1 ||
    requestsPerDay < 1
  ) {
    return null;
  }

  const ragEnabled = values.rag.enabled === true;
  const computeEnabled = values.compute.enabled === true;
  const totalMonthlyRequests = users * requestsPerDay * DAYS_PER_MONTH;
  const warnings = [];

  const inputRate = readRate(model.inputPer1K);
  const outputRate = readRate(model.outputPer1K);
  let openaiCost = null;

  if (inputRate === null || outputRate === null) {
    warnings.push(missingPriceWarning(model.name));
  } else {
    const billedPromptTokens = promptTokens + (ragEnabled ? docTokens : 0);
    const requestCost =
      (billedPromptTokens * inputRate) / 1000 +
      (completionTokens * outputRate) / 1000;
    openaiCost = round(totalMonthlyRequests * requestCost);
  }

  let ragCost = 0;
  let storageCost = 0;
  let computeCost = 0;

  if (ragEnabled) {
    const searchRate = readRate(catalog.infrastructure?.aiSearchBasicPerHour);
    const storageRate = readRate(catalog.infrastructure?.blobStoragePerGB);

    if (searchRate === null) {
      ragCost = null;
      warnings.push(missingPriceWarning("Azure AI Search"));
    } else {
      ragCost = round(searchRate * HOURS_PER_MONTH);
    }

    if (storageRate === null) {
      storageCost = null;
      warnings.push(missingPriceWarning("Blob Storage"));
    } else {
      storageCost = round(storageGB * storageRate);
    }
  }

  if (computeEnabled) {
    const computeRate = readRate(catalog.infrastructure?.appServiceB1PerHour);

    if (computeRate === null) {
      computeCost = null;
      warnings.push(missingPriceWarning("App Service B1"));
    } else {
      computeCost = round(computeRate * HOURS_PER_MONTH);
    }
  }

  const costParts = [openaiCost, ragCost, storageCost, computeCost];
  const monthlyTotal = costParts.every(Number.isFinite)
    ? round(costParts.reduce((total, cost) => total + cost, 0))
    : null;
  const growthRate = growthPct / 100;

  return {
    source: "frontend",
    region: catalog.region,
    currency: catalog.currency || "USD",
    totalMonthlyRequests,
    warnings,
    scenario: {
      name: ragEnabled ? `${model.name} + your content` : model.name,
      breakdown: {
        openai: openaiCost,
        rag: ragCost,
        storage: storageCost,
        compute: computeCost,
      },
      monthlyTotal,
      annualTotal:
        monthlyTotal === null ? null : calculateAnnualTotal(monthlyTotal, growthRate),
      costPerUser: monthlyTotal === null ? null : round(monthlyTotal / users, 4),
      costPerConversation:
        monthlyTotal === null
          ? null
          : round(monthlyTotal / totalMonthlyRequests, 4),
      nextMonthProjected:
        monthlyTotal === null ? null : round(monthlyTotal * (1 + growthRate)),
    },
    assumptions: {
      ragEnabled,
      computeEnabled,
    },
  };
}
