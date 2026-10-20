import { describe, expect, it } from "vitest";
import {
  bandFromSd,
  classifyLevel,
  levelProbabilities,
  thetaToSlider,
} from "../../src/engine/bands";
import type { ModelConfig } from "../../src/engine/types";

const cfg: ModelConfig = {
  RETAKE_BAND_MULTIPLIER: 1.41,
  UNCLEAR_WIDTH: 1.0,
  P_LEVEL_FIRM: 0.7,
  LEVEL_CUT: 0.4,
  DEEPER_SD_TARGET: 0.35,
  DEEPER_BUDGET_MAX: 20,
  FLAG_BAND_FACTOR: 1.25,
  GRID_NODES_PER_DIM: 11,
  ACCURACY_CLAIMS: { corrWithLongTest: null, retest: null },
};

describe("bands and levels", () => {
  it("slider is monotonic in theta", () => {
    const thetas = [-2, -1, 0, 1, 2];
    const sliders = thetas.map((t) => thetaToSlider(t, 0, 1));
    for (let i = 1; i < sliders.length; i++) {
      expect(sliders[i]!).toBeGreaterThan(sliders[i - 1]!);
    }
  });

  it("band is symmetric in s at mid; asymmetric near poles", () => {
    const mid = bandFromSd(0, 0.5, 0, 1);
    expect(Math.abs(mid.low + mid.high)).toBeLessThan(1e-9);

    const s = thetaToSlider(1.5, 0, 1);
    const high = bandFromSd(1.5, 0.4, 0, 1);
    expect(s - high.low).not.toBeCloseTo(high.high - s, 2);
  });

  it("level probabilities sum to 1", () => {
    const p = levelProbabilities(0.2, 0.5, 0.4);
    expect(p.pLow + p.pMid + p.pHigh).toBeCloseTo(1, 9);
  });

  it("firm vs soft vs unclear", () => {
    const peaked = levelProbabilities(1.5, 0.2, 0.4);
    const firm = classifyLevel(peaked.pLow, peaked.pMid, peaked.pHigh, 0.3, cfg);
    expect(firm.confidence).toBe("firm");
    expect(firm.level).toBe("high");

    const wide = classifyLevel(0.34, 0.33, 0.33, 1.2, cfg);
    expect(wide.confidence).toBe("unclear");
  });
});
