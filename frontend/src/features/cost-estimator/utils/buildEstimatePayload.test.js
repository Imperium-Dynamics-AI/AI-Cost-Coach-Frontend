import assert from "node:assert/strict";
import test from "node:test";
import { createInitialFormValues } from "../config/calculatorConfig.js";
import { buildEstimatePayload } from "./buildEstimatePayload.js";

test("sends only fields consumed by the current backend calculator", () => {
  const payload = buildEstimatePayload(createInitialFormValues());

  assert.deepEqual(Object.keys(payload).sort(), [
    "global",
    "openai",
    "rag",
    "resources",
    "scenarios",
    "storage",
  ]);
  assert.deepEqual(payload.resources, { compute: false });
  assert.deepEqual(payload.openai, {
    users: 500,
    requestsPerDay: 5,
    avgPromptTokens: 800,
    avgCompletionTokens: 400,
  });
  assert.deepEqual(payload.rag, { avgDocTokens: 600 });
  assert.deepEqual(payload.storage, { docStorageGB: 5 });
  assert.deepEqual(payload.global, { growthPct: 10 });
  assert.deepEqual(payload.scenarios, [
    { id: "A", model: "GPT-4o", forceRag: false },
    { id: "B", model: "GPT-4.1", forceRag: false },
    { id: "C", model: "GPT-4o", forceRag: true },
  ]);
});

test("maps the app-hosting choice to resources.compute", () => {
  const values = createInitialFormValues();
  values.compute.enabled = true;

  const payload = buildEstimatePayload(values);

  assert.equal(payload.resources.compute, true);
  assert.equal("compute" in payload, false);
});
