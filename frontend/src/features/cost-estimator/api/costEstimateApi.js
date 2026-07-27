const API_PATH = "/api/v1/cost-estimates";
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export const USING_PLACEHOLDER_API = import.meta.env.VITE_USE_MOCK_API === "true";

function createPlaceholderScenario(name) {
  return {
    name,
    breakdown: {
      openai: null,
      rag: null,
      storage: null,
      compute: null,
      apim: null,
      monitoring: null,
      identity: null,
      finetuning: null,
    },
    monthlyTotal: null,
    annualTotal: null,
    costPerUser: null,
    costPerConversation: null,
    nextMonthProjected: null,
  };
}

async function requestPlaceholderEstimate(payload) {
  await new Promise((resolve) => window.setTimeout(resolve, 350));

  return {
    currency: "USD",
    totalMonthlyRequests: null,
    cheapestId: null,
    warnings: [],
    placeholder: true,
    scenarios: Object.fromEntries(
      payload.scenarios.map((scenario) => [
        scenario.id,
        createPlaceholderScenario(
          scenario.forceRag ? `${scenario.model} + your content` : scenario.model,
        ),
      ]),
    ),
  };
}

async function readErrorMessage(response) {
  try {
    const body = await response.json();
    return body.message || `The estimate service returned ${response.status}.`;
  } catch {
    return `The estimate service returned ${response.status}.`;
  }
}

export async function requestCostEstimate(payload) {
  if (USING_PLACEHOLDER_API) {
    return requestPlaceholderEstimate(payload);
  }

  const response = await fetch(`${API_BASE_URL}${API_PATH}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const result = await response.json();

  if (!result?.scenarios) {
    throw new Error("The estimate service returned an unexpected response.");
  }

  return result;
}
