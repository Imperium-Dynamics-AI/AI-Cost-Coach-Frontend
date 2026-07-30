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

test("ranks models when shared infrastructure prices are unavailable", () => {
  const values = valuesFor("model-mid");
  values.rag.enabled = true;
  values.compute.enabled = true;

  const result = pickComparisonModels(values, {
    ...CATALOG,
    infrastructure: {
      aiSearchBasicPerHour: null,
      blobStoragePerGB: null,
      appServiceB1PerHour: null,
    },
  });

  assert.deepEqual(
    result.map((comparison) => comparison.id),
    ["selected", "cheaper", "pricier"],
  );
});

test("skips equal-cost models instead of mislabeling them", () => {
  const tiedCatalog = {
    ...CATALOG,
    models: [
      CATALOG.models[0],
      CATALOG.models[1],
      {
        id: "model-mid-tie",
        name: "Model Mid Tie",
        inputPer1K: 0.005,
        outputPer1K: 0.005,
      },
      CATALOG.models[2],
    ],
  };

  const result = pickComparisonModels(valuesFor("model-mid"), tiedCatalog);

  assert.deepEqual(
    result.map((comparison) => comparison.model.id),
    ["model-mid", "model-cheap", "model-expensive"],
  );
});
