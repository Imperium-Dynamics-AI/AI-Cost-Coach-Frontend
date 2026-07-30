import assert from "node:assert/strict";
import test from "node:test";
import { classifyCostDifference } from "./classifyCostDifference.js";

test("classifies only finite totals as cheaper or pricier", () => {
  assert.equal(classifyCostDifference(8, 10), "cheaper");
  assert.equal(classifyCostDifference(12, 10), "pricier");
  assert.equal(classifyCostDifference(null, 10), "unavailable");
  assert.equal(classifyCostDifference(10, null), "unavailable");
});

test("distinguishes the selected baseline from an equal-cost alternative", () => {
  assert.equal(classifyCostDifference(10, 10, true), "baseline");
  assert.equal(classifyCostDifference(10, 10), "same");
});
