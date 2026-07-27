import assert from "node:assert/strict";
import test from "node:test";
import { createInitialFormValues } from "../config/calculatorConfig.js";
import { calculateLocalEstimate } from "./calculateLocalEstimate.js";

function createCatalog(overrides = {}) {
  return {
    region: "eastus",
    currency: "USD",
    models: [
      {
        id: "gpt-test",
        name: "GPT-Test",
        inputPer1K: 0.01,
        outputPer1K: 0.02,
      },
    ],
    infrastructure: {
      aiSearchBasicPerHour: 0.1,
      blobStoragePerGB: 0.02,
      appServiceB1PerHour: 0.2,
      ...overrides,
    },
  };
}

function createValues() {
  const values = createInitialFormValues();
  values.openai.modelId = "gpt-test";
  values.openai.users = 10;
  values.openai.requestsPerDay = 2;
  values.openai.avgPromptTokens = 100;
  values.openai.avgCompletionTokens = 50;
  values.rag.avgDocTokens = 20;
  values.storage.docStorageGB = 5;
  values.global.growthPct = 10;
  return values;
}

test("calculates the selected setup locally with the backend formulas", () => {
  const values = createValues();
  values.rag.enabled = true;
  values.compute.enabled = true;

  const result = calculateLocalEstimate(values, createCatalog());

  assert.equal(result.totalMonthlyRequests, 600);
  assert.deepEqual(result.scenario.breakdown, {
    openai: 1.32,
    rag: 73,
    storage: 0.1,
    compute: 146,
  });
  assert.equal(result.scenario.monthlyTotal, 220.42);
  assert.equal(result.scenario.costPerUser, 22.042);
  assert.equal(result.scenario.costPerConversation, 0.3674);
  assert.equal(result.scenario.nextMonthProjected, 242.46);
  assert.ok(result.scenario.annualTotal > result.scenario.monthlyTotal * 12);
  assert.deepEqual(result.warnings, []);
});

test("updates immediately when RAG and hosting are excluded", () => {
  const values = createValues();
  values.rag.enabled = false;
  values.compute.enabled = false;

  const result = calculateLocalEstimate(values, createCatalog());

  assert.deepEqual(result.scenario.breakdown, {
    openai: 1.2,
    rag: 0,
    storage: 0,
    compute: 0,
  });
  assert.equal(result.scenario.monthlyTotal, 1.2);
});

test("keeps partial breakdowns but withholds totals when a required rate is missing", () => {
  const values = createValues();
  values.rag.enabled = true;
  values.compute.enabled = false;

  const result = calculateLocalEstimate(
    values,
    createCatalog({ aiSearchBasicPerHour: null }),
  );

  assert.equal(result.scenario.breakdown.openai, 1.32);
  assert.equal(result.scenario.breakdown.rag, null);
  assert.equal(result.scenario.monthlyTotal, null);
  assert.match(result.warnings[0], /Azure AI Search pricing is unavailable/);
});

test("waits for a model selection that exists in the fetched catalog", () => {
  const values = createValues();
  values.openai.modelId = "unknown";

  assert.equal(calculateLocalEstimate(values, createCatalog()), null);
});
