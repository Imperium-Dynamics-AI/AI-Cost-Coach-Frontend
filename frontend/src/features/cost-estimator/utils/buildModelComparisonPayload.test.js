import assert from "node:assert/strict";
import test from "node:test";
import { createInitialFormValues } from "../config/calculatorConfig.js";
import { buildModelComparisonPayload } from "./buildModelComparisonPayload.js";

const MODELS = [
  { id: "gpt-4o", name: "GPT-4o", inputPer1K: 0.001, outputPer1K: 0.002 },
  { id: "gpt-4.1", name: "GPT-4.1", inputPer1K: 0.003, outputPer1K: 0.004 },
];

const CATALOG = {
  region: "eastus",
  currency: "USD",
  models: MODELS,
  infrastructure: {
    aiSearchBasicPerHour: 0.1,
    blobStoragePerGB: 0.02,
    appServiceB1PerHour: 0.075,
  },
};

function createCompletedValues() {
  const values = createInitialFormValues();
  values.openai.modelId = "gpt-4.1";
  values.rag.enabled = true;
  values.compute.enabled = true;
  return values;
}

test("requires a current priced model, RAG choice, and hosting choice", () => {
  assert.throws(
    () => buildModelComparisonPayload(createInitialFormValues(), MODELS, CATALOG),
    /priced model, document search, and app hosting choices are required/i,
  );
});

test("rejects a restored model ID that is no longer in the catalog", () => {
  const values = createCompletedValues();
  values.openai.modelId = "retired-model";

  assert.throws(
    () => buildModelComparisonPayload(values, MODELS, CATALOG),
    /priced model, document search, and app hosting choices are required/i,
  );
});

test("builds a cost-estimates request with the same assumptions on every scenario", () => {
  const { costEstimateRequest, meta } = buildModelComparisonPayload(
    createCompletedValues(),
    MODELS,
    CATALOG,
  );

  assert.equal(costEstimateRequest.scenarios.length, meta.length);
  assert.ok(costEstimateRequest.scenarios.length >= 1);

  // Every scenario shares identical deployment assumptions — only the
  // model differs. This is the "don't change the scenario" rule.
  for (const scenario of costEstimateRequest.scenarios) {
    assert.equal(scenario.forceRag, true);
  }
  assert.deepEqual(costEstimateRequest.resources, { compute: true });
  assert.deepEqual(costEstimateRequest.openai, {
    users: 500,
    requestsPerDay: 5,
    avgPromptTokens: 800,
    avgCompletionTokens: 400,
  });
  assert.deepEqual(costEstimateRequest.rag, { avgDocTokens: 600 });
  assert.deepEqual(costEstimateRequest.storage, { docStorageGB: 5 });
  assert.deepEqual(costEstimateRequest.global, { growthPct: 10 });

  // The selected scenario uses the model's display NAME (matching the
  // backend's MODEL_SKU_MAP keys), not its catalog slug id.
  const selectedScenario = costEstimateRequest.scenarios.find((s) => s.id === "selected");
  assert.equal(selectedScenario.model, "GPT-4.1");

  const selectedMeta = meta.find((item) => item.id === "selected");
  assert.equal(selectedMeta.modelId, "gpt-4.1");
  assert.equal(selectedMeta.modelName, "GPT-4.1");
});

test("preserves the user's disabled RAG and hosting choices on every scenario", () => {
  const values = createCompletedValues();
  values.rag.enabled = false;
  values.compute.enabled = false;

  const { costEstimateRequest } = buildModelComparisonPayload(values, [MODELS[1]], {
    ...CATALOG,
    models: [MODELS[1]],
  });

  assert.deepEqual(costEstimateRequest.resources, { compute: false });
  for (const scenario of costEstimateRequest.scenarios) {
    assert.equal(scenario.forceRag, false);
  }
});
