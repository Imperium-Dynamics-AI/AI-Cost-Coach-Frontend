import assert from "node:assert/strict";
import test from "node:test";
import { createInitialFormValues } from "../config/calculatorConfig.js";
import { buildEstimatePayload } from "./buildEstimatePayload.js";

test("builds the documented default backend payload", () => {
  const payload = buildEstimatePayload(createInitialFormValues());

  assert.equal(payload.openai.model, "GPT-4o");
  assert.equal(payload.scenarios.length, 3);
  assert.deepEqual(payload.scenarios[0], {
    id: "A",
    model: "GPT-4o",
    forceRag: false,
  });
  assert.deepEqual(payload.compute.environments, {
    dev: true,
    test: false,
    prod: true,
  });
  assert.equal(payload.identity.keyVaultIncluded, true);
  assert.equal(payload.global.infraOverheadUsd, 40);
});

test("uses the selected model for the primary comparison option", () => {
  const values = createInitialFormValues();
  values.openai.model = "o4-mini";
  values.resources.monitoring = true;

  const payload = buildEstimatePayload(values);

  assert.equal(payload.scenarios[0].model, "o4-mini");
  assert.equal(payload.scenarios[1].model, "GPT-4.1");
  assert.equal(payload.resources.monitoring, true);
});
