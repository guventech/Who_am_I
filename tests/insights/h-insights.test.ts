import { describe, expect, it } from "vitest";
import type { TraitScore } from "@/engine/types";
import { getInsightEntry } from "@/insights/library";
import { selectInsightsV1 } from "@/insights/select-v1";

function score(
  traitId: TraitScore["traitId"],
  slider: number,
  width = 0.8,
): TraitScore {
  const retakeLow = slider - width / 2;
  const retakeHigh = slider + width / 2;
  return {
    traitId,
    theta: slider,
    sd: 0.3,
    slider,
    retakeLow,
    retakeHigh,
    credibleLow: retakeLow,
    credibleHigh: retakeHigh,
    level: slider < -0.4 ? "low" : slider > 0.4 ? "high" : "mid",
    confidence: "firm",
    pLow: 0.2,
    pMid: 0.3,
    pHigh: 0.5,
  };
}

describe("H insights", () => {
  it("has draft H low mid high entries", () => {
    for (const level of ["low", "mid", "high"] as const) {
      const e = getInsightEntry("H", level, { allowDrafts: true });
      expect(e?.reviewStatus).toBe("draft");
      expect(e?.traitId).toBe("H");
    }
  });

  it("selects H when H is present in scores", () => {
    const selected = selectInsightsV1(
      [
        score("E", 0.1),
        score("A", 0.1),
        score("C", 0.1),
        score("ES", 0.1),
        score("O", 0.1),
        score("H", 0.8),
      ],
      { allowDrafts: true },
    );
    expect(selected.shownEntryIds.some((id) => id.startsWith("H-"))).toBe(true);
  });

  it("skips H when H is absent", () => {
    const selected = selectInsightsV1(
      [
        score("E", 0.8),
        score("A", -0.7),
        score("C", 0.5),
        score("ES", 0.2),
        score("O", -0.5),
      ],
      { allowDrafts: true },
    );
    expect(selected.shownEntryIds.every((id) => !id.startsWith("H-"))).toBe(
      true,
    );
  });
});
