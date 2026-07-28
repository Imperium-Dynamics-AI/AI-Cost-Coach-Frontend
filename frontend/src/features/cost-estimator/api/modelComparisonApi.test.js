import assert from "node:assert/strict";
import test from "node:test";
import {
  requestModelCatalog,
  requestModelComparisons,
} from "./modelComparisonApi.js";

function createScenarioResult(name) {
  return {
    name,
    breakdown: {},
    monthlyTotal: 10,
    annualTotal: 120,
    costPerUser: 0.1,
    costPerConversation: 0.001,
    nextMonthProjected: 11,
  };
}

function createMetaItem(id, modelId, modelName) {
  return {
    id,
    label: `${modelName} option`,
    relationship: id === "selected" ? "selected" : "cheaper",
    reason: `${modelName} for the same usage.`,
    modelId,
    modelName,
  };
}

async function withMockFetch(handler, callback) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = handler;

  try {
    return await callback();
  } finally {
    globalThis.fetch = originalFetch;
  }
}

test("loads and normalizes the backend model catalog", async () => {
  let requestedUrl;
  let requestedOptions;

  await withMockFetch(
    async (url, options) => {
      requestedUrl = url;
      requestedOptions = options;
      return {
        ok: true,
        json: async () => ({
          region: "eastus",
          currency: "USD",
          models: [
            {
              id: "gpt-test",
              name: "GPT-Test",
              inputPer1K: "0.001",
              outputPer1K: null,
            },
          ],
          infrastructure: {
            aiSearchBasicPerHour: "0.14",
            blobStoragePerGB: 0.02,
            appServiceB1PerHour: null,
          },
        }),
      };
    },
    async () => {
      const catalog = await requestModelCatalog();

      assert.equal(requestedUrl, "/api/v1/models");
      assert.equal(requestedOptions, undefined);
      assert.equal(catalog.models[0].id, "gpt-test");
      assert.equal(catalog.models[0].inputPer1K, 0.001);
      assert.equal(catalog.models[0].outputPer1K, null);
    },
  );
});

test("prices comparisons via the existing cost-estimates endpoint, not the unimplemented one", async () => {
  const meta = [
    createMetaItem("selected", "gpt-4.1", "GPT-4.1"),
    createMetaItem("cheaper", "gpt-4.1-mini", "GPT-4.1 mini"),
  ];
  const costEstimateRequest = {
    resources: { compute: false },
    scenarios: [
      { id: "selected", model: "GPT-4.1", forceRag: true },
      { id: "cheaper", model: "GPT-4.1 mini", forceRag: true },
    ],
    openai: { users: 500, requestsPerDay: 5, avgPromptTokens: 800, avgCompletionTokens: 400 },
    rag: { avgDocTokens: 600 },
    storage: { docStorageGB: 5 },
    global: { growthPct: 10 },
  };

  let requestedUrl;
  let requestedOptions;

  await withMockFetch(
    async (url, options) => {
      requestedUrl = url;
      requestedOptions = options;
      return {
        ok: true,
        json: async () => ({
          currency: "USD",
          totalMonthlyRequests: 75000,
          cheapestId: "cheaper",
          warnings: [],
          scenarios: {
            selected: createScenarioResult("GPT-4.1"),
            cheaper: createScenarioResult("GPT-4.1 mini"),
          },
        }),
      };
    },
    async () => {
      const result = await requestModelComparisons({ meta, costEstimateRequest });

      assert.equal(requestedUrl, "/api/v1/cost-estimates");
      assert.notEqual(requestedUrl, "/api/v1/model-comparisons");
      assert.equal(requestedOptions.method, "POST");
      assert.equal(requestedOptions.body, JSON.stringify(costEstimateRequest));
      assert.deepEqual(
        result.comparisons.map((comparison) => comparison.id),
        ["selected", "cheaper"],
      );
      assert.equal(result.comparisons[0].model.name, "GPT-4.1");
      assert.equal(result.comparisons[0].configuration.ragEnabled, true);
      assert.equal(result.cheapestId, "cheaper");
    },
  );
});

test("accepts a single-scenario comparison (model at the edge of the catalog)", async () => {
  const meta = [createMetaItem("selected", "gpt-4.1", "GPT-4.1")];
  const costEstimateRequest = {
    resources: { compute: false },
    scenarios: [{ id: "selected", model: "GPT-4.1", forceRag: false }],
    openai: { users: 500, requestsPerDay: 5, avgPromptTokens: 800, avgCompletionTokens: 400 },
    rag: { avgDocTokens: 600 },
    storage: { docStorageGB: 5 },
    global: { growthPct: 10 },
  };

  await withMockFetch(
    async () => ({
      ok: true,
      json: async () => ({
        cheapestId: "selected",
        scenarios: { selected: createScenarioResult("GPT-4.1") },
      }),
    }),
    async () => {
      const result = await requestModelComparisons({ meta, costEstimateRequest });
      assert.equal(result.comparisons.length, 1);
    },
  );
});

test("errors clearly when the backend omits a scenario the frontend asked for", async () => {
  const meta = [
    createMetaItem("selected", "gpt-4.1", "GPT-4.1"),
    createMetaItem("cheaper", "gpt-4.1-mini", "GPT-4.1 mini"),
  ];
  const costEstimateRequest = {
    resources: { compute: false },
    scenarios: [
      { id: "selected", model: "GPT-4.1", forceRag: false },
      { id: "cheaper", model: "GPT-4.1 mini", forceRag: false },
    ],
    openai: { users: 500, requestsPerDay: 5, avgPromptTokens: 800, avgCompletionTokens: 400 },
    rag: { avgDocTokens: 600 },
    storage: { docStorageGB: 5 },
    global: { growthPct: 10 },
  };

  await withMockFetch(
    async () => ({
      ok: true,
      // Backend only returned "selected", missing "cheaper"
      json: async () => ({
        cheapestId: "selected",
        scenarios: { selected: createScenarioResult("GPT-4.1") },
      }),
    }),
    async () => {
      await assert.rejects(
        requestModelComparisons({ meta, costEstimateRequest }),
        /did not return scenario 'cheaper'/,
      );
    },
  );
});

test("rejects a response with an unknown cheapestId", async () => {
  const meta = [createMetaItem("selected", "gpt-4.1", "GPT-4.1")];
  const costEstimateRequest = {
    resources: { compute: false },
    scenarios: [{ id: "selected", model: "GPT-4.1", forceRag: false }],
    openai: { users: 500, requestsPerDay: 5, avgPromptTokens: 800, avgCompletionTokens: 400 },
    rag: { avgDocTokens: 600 },
    storage: { docStorageGB: 5 },
    global: { growthPct: 10 },
  };

  await withMockFetch(
    async () => ({
      ok: true,
      json: async () => ({
        cheapestId: "missing",
        scenarios: { selected: createScenarioResult("GPT-4.1") },
      }),
    }),
    async () => {
      await assert.rejects(
        requestModelComparisons({ meta, costEstimateRequest }),
        /unknown cheapest comparison/,
      );
    },
  );
});
