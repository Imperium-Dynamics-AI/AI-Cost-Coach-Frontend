import assert from "node:assert/strict";
import test from "node:test";
import { createInitialFormValues } from "../config/calculatorConfig.js";
import { buildModelComparisonPayload } from "./buildModelComparisonPayload.js";

const MODELS = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    inputPer1K: 0.001,
    outputPer1K: 0.002,
  },
  {
    id: "gpt-4.1",
    name: "GPT-4.1",
    inputPer1K: 0.003,
    outputPer1K: 0.004,
  },
];

function createCompletedValues() {
  const values = createInitialFormValues();
  values.openai.modelId = "gpt-4.1";
  values.rag.enabled = true;
  values.compute.enabled = true;
  return values;
}

test("requires a current priced model, RAG choice, and hosting choice", () => {
  assert.throws(
    () => buildModelComparisonPayload(createInitialFormValues(), MODELS),
    /priced model, document search, and app hosting choices are required/i,
  );
});

test("rejects a restored model ID that is no longer in the catalog", () => {
  const values = createCompletedValues();
  values.openai.modelId = "retired-model";

  assert.throws(
    () => buildModelComparisonPayload(values, MODELS),
    /priced model, document search, and app hosting choices are required/i,
  );
});

test("sends only the selected model ID and raw user inputs", () => {
  const payload = buildModelComparisonPayload(createCompletedValues(), MODELS);

  assert.deepEqual(payload, {
    selectedModelId: "gpt-4.1",
    resources: { compute: true },
    openai: {
      users: 500,
      requestsPerDay: 5,
      avgPromptTokens: 800,
      avgCompletionTokens: 400,
    },
    rag: {
      enabled: true,
      avgDocTokens: 600,
    },
    storage: { docStorageGB: 5 },
    global: { growthPct: 10 },
  });
  assert.equal("scenarios" in payload, false);
  assert.equal("model" in payload.openai, false);
  assert.equal("modelName" in payload, false);
  assert.equal("prices" in payload, false);
});

test("preserves the user's disabled RAG and hosting choices", () => {
  const values = createCompletedValues();
  values.rag.enabled = false;
  values.compute.enabled = false;

  const payload = buildModelComparisonPayload(values, [MODELS[1]]);

  assert.equal(payload.selectedModelId, "gpt-4.1");
  assert.deepEqual(payload.resources, { compute: false });
  assert.deepEqual(payload.rag, { enabled: false, avgDocTokens: 600 });
});

test("does not change the payload when catalog order or prices change", () => {
  const values = createCompletedValues();
  const original = buildModelComparisonPayload(values, MODELS);
  const reorderedWithNewPrices = buildModelComparisonPayload(values, [
    { ...MODELS[1], inputPer1K: 99, outputPer1K: 199 },
    MODELS[0],
  ]);

  assert.deepEqual(reorderedWithNewPrices, original);
});
