import assert from "node:assert/strict";
import test from "node:test";
import { createInitialFormValues } from "../config/calculatorConfig.js";
import { pickComparisonModels } from "./pickComparisonModels.js";

const CATALOG = {
  region: "eastus",
  currency: "USD",
  models: [
    { id: "model-cheap", name: "Model Cheap", inputPer1K: 0.001, outputPer1K: 0.001 },
    { id: "model-mid", name: "Model Mid", inputPer1K: 0.005, outputPer1K: 0.005 },
    { id: "model-expensive", name: "Model Expensive", inputPer1K: 0.02, outputPer1K: 0.02 },
  ],
  infrastructure: {
    aiSearchBasicPerHour: 0.1,
    blobStoragePerGB: 0.02,
    appServiceB1PerHour: 0.075,
  },
};

function valuesFor(modelId) {
  const values = createInitialFormValues();
  values.openai.modelId = modelId;
  values.rag.enabled = false;
  values.compute.enabled = false;
  return values;
}

test("middle-ranked model gets both a cheaper and a pricier neighbor", () => {
  const result = pickComparisonModels(valuesFor("model-mid"), CATALOG);

  assert.equal(result.length, 3);
  assert.deepEqual(
    result.map((c) => [c.id, c.model.id]),
    [
      ["selected", "model-mid"],
      ["cheaper", "model-cheap"],
      ["pricier", "model-expensive"],
    ],
  );
});

test("cheapest model has no cheaper neighbor", () => {
  const result = pickComparisonModels(valuesFor("model-cheap"), CATALOG);

  assert.deepEqual(
    result.map((c) => c.id),
    ["selected", "pricier"],
  );
  assert.equal(result[1].model.id, "model-mid");
});

test("priciest model has no pricier neighbor", () => {
  const result = pickComparisonModels(valuesFor("model-expensive"), CATALOG);

  assert.deepEqual(
    result.map((c) => c.id),
    ["selected", "cheaper"],
  );
  assert.equal(result[1].model.id, "model-mid");
});

test("returns null when the selected model isn't in the priced catalog", () => {
  const result = pickComparisonModels(valuesFor("not-a-real-model"), CATALOG);
  assert.equal(result, null);
});
