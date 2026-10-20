import { describe, expect, it } from "vitest";
import { cholesky } from "../../src/engine/math";
import { loadModelVersion } from "../../src/engine/load-content";
import { priorSummary } from "../../src/engine/grid";

describe("prior", () => {
  it("prior covariance is positive definite (Cholesky)", () => {
    const model = loadModelVersion();
    expect(() => cholesky(model.priorCov, 5)).not.toThrow();
  });

  it("zero items ⇒ posterior equals prior (mean≈0, sd≈1 within GH error)", () => {
    const model = loadModelVersion();
    const post = priorSummary(model);
    for (let i = 0; i < 5; i++) {
      expect(Math.abs(post.mean[i]!)).toBeLessThan(0.05);
      // 11³ GH in 5D has noticeable quadrature error on marginal SD
      expect(post.sd[i]!).toBeGreaterThan(0.8);
      expect(post.sd[i]!).toBeLessThan(1.25);
    }
  });
});
