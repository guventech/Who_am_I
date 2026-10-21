import { describe, expect, it } from "vitest";
import type { TraitScore } from "@/engine/types";
import { INSIGHTS_VERSION, getInsightEntry } from "@/insights/library";
import { formatResultsPlainText, selectInsightsV1 } from "@/insights/select-v1";

function score(
  traitId: TraitScore["traitId"],
  slider: number,
  retakeLow: number,
  retakeHigh: number,
): TraitScore {
  return {
    traitId,
    theta: slider,
    sd: 0.4,
    slider,
    level: slider < -0.4 ? "low" : slider > 0.4 ? "high" : "mid",
    confidence: "firm",
    retakeLow,
    retakeHigh,
    credibleLow: retakeLow,
    credibleHigh: retakeHigh,
    pLow: 0.2,
    pMid: 0.3,
    pHigh: 0.5,
  };
}

describe("selectInsightsV1", () => {
  it("matches the prompt example scores", () => {
    const traits = [
      score("E", 0.5, -0.45, 1.0), // width 1.45 → less certain
      score("A", 0.88, 0.35, 0.99),
      score("C", 0.73, 0.02, 0.97),
      score("ES", 0.17, -0.57, 0.78), // mid, width 1.35 less certain
      score("O", 0.48, -0.3, 0.91), // width 1.21 less certain
    ];
    const selected = selectInsightsV1(traits);
    expect(selected.strengths.map((s) => s.entryId)).toEqual([
      "A-high",
      "C-high",
      "E-high",
    ]);
    expect(selected.strengths[2]?.soft).toBe(true);
    expect(selected.strengths[2]?.strength.startsWith("You may")).toBe(true);
    expect(selected.watchOuts.map((w) => w.entryId)).toEqual([
      "A-high",
      "C-high",
    ]);
    expect(selected.watchOuts.every((w) => w.soft === false)).toBe(true);
  });

  it("keeps one soft watch-out with tips when every trait is less certain", () => {
    const traits = [
      score("E", 0.2, -0.8, 0.8),
      score("A", 0.88, -0.2, 1.3),
      score("C", -0.55, -1.2, 0.3),
      score("ES", 0.1, -0.75, 0.75),
      score("O", 0.48, -0.7, 0.8),
    ];
    for (const t of traits) {
      expect(t.retakeHigh - t.retakeLow).toBeGreaterThan(1.4);
    }
    const selected = selectInsightsV1(traits);
    expect(selected.watchOuts).toHaveLength(1);
    const watch = selected.watchOuts[0]!;
    expect(watch.soft).toBe(true);
    expect(watch.tips.length).toBeGreaterThan(0);
    expect(watch.entryId).toBe("A-high");
    expect(watch.watchOut).toBe(getInsightEntry("A", "high")!.watchOutSoft);
    expect(watch.watchOut).not.toBe(getInsightEntry("A", "high")!.watchOut);
  });

  it("puts a space before (less certain) in copied text", () => {
    const text = formatResultsPlainText(
      [
        {
          title: "Handling stress",
          phrase: "About in the middle",
          lessCertain: true,
        },
      ],
      {
        version: INSIGHTS_VERSION,
        shownEntryIds: ["E-mid"],
        strengths: [
          {
            entryId: "E-mid",
            strength: "You may work alone or with a group, and switch easily.",
            interview: "I am fine leading a meeting.",
            cv: "Comfortable both in team settings and in independent work.",
            soft: true,
          },
        ],
        watchOuts: [
          {
            entryId: "E-mid",
            watchOut: "Other people may not know which kind of work gives you energy.",
            tips: ["Notice which days leave you tired."],
            soft: true,
          },
        ],
      },
    );
    expect(text).toContain("About in the middle (less certain)");
    expect(text).not.toMatch(/[+-]?\d+\.\d+/);
    expect(text).toContain("switch easily. (less certain)");
    expect(text).toContain("energy. (less certain)");
    expect(text).not.toMatch(/\S\(less certain\)/);
  });
});
