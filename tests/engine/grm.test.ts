import { describe, expect, it } from "vitest";
import { categoryProbs, logLikItem } from "../../src/engine/grm";
import type { ResponseValue } from "../../src/engine/types";
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
  it("optimized likelihood preserves normalized category probabilities at extreme values", () => {
    for (const e of [-100, -20, -2, 0, 2, 20, 100]) {
      const theta = [e, 0, 0, 0, 0];
      const probabilities = categoryProbs(item, theta);
      for (let response = 1; response <= 5; response++) {
        expect(Math.exp(logLikItem(item, theta, response as ResponseValue))).toBeCloseTo(
          Math.max(1e-9, Math.min(1 - 1e-9, probabilities[response - 1]!)),
          12,
        );
      }
    }
  });
  it("category probabilities sum to 1", () => {
    for (const e of [-2, -1, 0, 1, 2]) {
      const probs = categoryProbs(item, [e, 0, 0, 0, 0]);
      const sum = probs.reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1, 9);
    }
  });
});
