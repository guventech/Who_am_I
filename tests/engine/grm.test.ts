import { describe, expect, it } from "vitest";
import { categoryProbs } from "../../src/engine/grm";
import type { Item } from "../../src/engine/types";

const item: Item = {
  id: "T01",
  pool: "core",
  primaryTrait: "E",
  loadings: { E: 1.2 },
  thresholds: [-1.8, -0.7, 0.4, 1.5],
  keyed: 1,
  isAnchor: false,
  status: "active",
  source: "ipip",
  sourceVerified: false,
  version: 1,
};

describe("GRM", () => {
  it("category probabilities sum to 1", () => {
    for (const e of [-2, -1, 0, 1, 2]) {
      const probs = categoryProbs(item, [e, 0, 0, 0, 0]);
      const sum = probs.reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1, 9);
    }
  });
});
