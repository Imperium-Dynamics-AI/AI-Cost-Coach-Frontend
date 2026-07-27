import assert from "node:assert/strict";
import test from "node:test";
import { createInitialFormValues } from "../config/calculatorConfig.js";
import { buildEstimatePayload } from "./buildEstimatePayload.js";

test("requires the business user to choose model, RAG, and hosting options", () => {
  assert.throws(
    () => buildEstimatePayload(createInitialFormValues()),
    /Model, document search, and app hosting choices are required/,
  );
});

test("compares the selected and alternative models with RAG enabled", () => {
  const values = createInitialFormValues();
  values.openai.model = "GPT-4.1";
  values.rag.enabled = true;
  values.compute.enabled = true;

  const payload = buildEstimatePayload(values);

  assert.deepEqual(payload.resources, { compute: true });
  assert.deepEqual(payload.scenarios, [
    { id: "A", model: "GPT-4.1", forceRag: true },
    { id: "B", model: "GPT-4o", forceRag: true },
    { id: "C", model: "GPT-4.1", forceRag: false },
  ]);
  assert.deepEqual(payload.openai, {
    users: 500,
    requestsPerDay: 5,
    avgPromptTokens: 800,
    avgCompletionTokens: 400,
  });
  assert.deepEqual(payload.rag, { avgDocTokens: 600 });
  assert.deepEqual(payload.storage, { docStorageGB: 5 });
  assert.deepEqual(payload.global, { growthPct: 10 });
});

test("adds a with-RAG comparison when document search is disabled", () => {
  const values = createInitialFormValues();
  values.openai.model = "GPT-4o";
  values.rag.enabled = false;
  values.compute.enabled = false;

  const payload = buildEstimatePayload(values);

  assert.deepEqual(payload.scenarios, [
    { id: "A", model: "GPT-4o", forceRag: false },
    { id: "B", model: "GPT-4.1", forceRag: false },
    { id: "C", model: "GPT-4o", forceRag: true },
  ]);
  assert.deepEqual(payload.resources, { compute: false });
  assert.deepEqual(payload.rag, { avgDocTokens: 600 });
  assert.deepEqual(payload.storage, { docStorageGB: 5 });
  assert.equal("model" in payload.openai, false);
});
