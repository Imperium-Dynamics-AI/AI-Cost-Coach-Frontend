import assert from "node:assert/strict";
import test from "node:test";
import {
  requestModelCatalog,
  requestModelComparisons,
} from "./modelComparisonApi.js";

function createComparison(id, modelId, name) {
  return {
    id,
    label: `${name} option`,
    relationship: id === "selected" ? "selected" : "family-member",
    reason: `${name} was selected by the backend.`,
    model: { id: modelId, name },
    configuration: { ragEnabled: true, computeEnabled: false },
    estimate: {
      name: `${name} + your content`,
      breakdown: {},
      monthlyTotal: 10,
      annualTotal: 120,
      costPerUser: 0.1,
      costPerConversation: 0.001,
      nextMonthProjected: 11,
    },
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

test("posts the selected-model payload only to the new comparison endpoint", async () => {
  const payload = {
    selectedModelId: "gpt-4.1",
    resources: { compute: false },
    openai: { users: 500 },
    rag: { enabled: true },
  };
  let requestedUrl;
  let requestedOptions;
  const returnedComparisons = [
    createComparison("selected", "gpt-4.1", "GPT-4.1"),
    createComparison("compact", "gpt-4.1-mini", "GPT-4.1 mini"),
  ];

  await withMockFetch(
    async (url, options) => {
      requestedUrl = url;
      requestedOptions = options;
      return {
        ok: true,
        json: async () => ({
          currency: "USD",
          cheapestId: "compact",
          warnings: [],
          comparisons: returnedComparisons,
        }),
      };
    },
    async () => {
      const result = await requestModelComparisons(payload);

      assert.equal(requestedUrl, "/api/v1/model-comparisons");
      assert.notEqual(requestedUrl, "/api/v1/cost-estimates");
      assert.equal(requestedOptions.method, "POST");
      assert.equal(requestedOptions.body, JSON.stringify(payload));
      assert.deepEqual(
        result.comparisons.map((comparison) => comparison.id),
        ["selected", "compact"],
      );
    },
  );
});

test("accepts a single backend-selected comparison", async () => {
  const response = {
    ok: true,
    json: async () => ({
      cheapestId: "selected",
      comparisons: [createComparison("selected", "gpt-4.1", "GPT-4.1")],
    }),
  };

  await withMockFetch(
    async () => response,
    async () => {
      const result = await requestModelComparisons({ selectedModelId: "gpt-4.1" });
      assert.equal(result.comparisons.length, 1);
    },
  );
});

test("rejects empty, duplicate, and internally inconsistent responses", async () => {
  const invalidBodies = [
    { comparisons: [] },
    {
      comparisons: [
        createComparison("duplicate", "one", "One"),
        createComparison("duplicate", "two", "Two"),
      ],
    },
    {
      cheapestId: "missing",
      comparisons: [createComparison("selected", "one", "One")],
    },
    {
      comparisons: [
        {
          ...createComparison("selected", "one", "One"),
          configuration: {},
        },
      ],
    },
  ];

  for (const body of invalidBodies) {
    await withMockFetch(
      async () => ({ ok: true, json: async () => body }),
      async () => {
        await assert.rejects(
          requestModelComparisons({ selectedModelId: "one" }),
          /comparison service returned|duplicate comparison IDs|unknown cheapest comparison/,
        );
      },
    );
  }
});
