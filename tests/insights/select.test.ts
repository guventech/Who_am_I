import { describe, expect, it } from "vitest";
import type { TraitScore } from "@/engine/types";
import { CORE_TRAIT_IDS } from "@/engine/types";
import { filterInsightLibrary } from "@/insights/filter-drafts";
import { selectInsights } from "@/insights/select";
import type { InsightEntry, InsightLibrary } from "@/insights/types";

function score(
  traitId: TraitScore["traitId"],
  overrides: Partial<TraitScore>,
): TraitScore {
  return {
    traitId,
    theta: 0,
    sd: 0.5,
    slider: 0,
    credibleLow: -0.5,
    credibleHigh: 0.5,
    retakeLow: -0.7,
    retakeHigh: 0.7,
    pLow: 0.2,
    pMid: 0.6,
    pHigh: 0.2,
    level: "mid",
    confidence: "firm",
    ...overrides,
  };
}

function entry(
  partial: Pick<InsightEntry, "id" | "key" | "variant"> &
    Partial<InsightEntry>,
): InsightEntry {
  return {
    reviewStatus: "draft",
    version: 1,
    strengths: [
      {
        title: "Strength",
        interviewLine: "Tell me about a time…",
        cvLine: "Did [X] resulting in [Y].",
        teamLine: "I tend to…",
      },
    ],
    watchOuts: ["can come across as intense when under time pressure"],
    improve: [{ area: "Pacing", actions: ["Ask one clarifying question before proposing.", "Schedule a 10-minute check-in midweek."] }],
    workWithOthers: "Share your preference early; invite the opposite pole to weigh in.",
    tradeOff: "Energy for people can cost quiet recovery time.",
    ...partial,
  };
}

const library: InsightLibrary = {
  entries: [
    entry({ id: "E-high-firm", key: "E:high", variant: "firm" }),
    entry({ id: "E-high-soft", key: "E:high", variant: "soft" }),
    entry({ id: "A-low-firm", key: "A:low", variant: "firm" }),
    entry({
      id: "combo-Ehigh-Alow-firm",
      key: "E:high+A:low",
      variant: "firm",
      strengths: [
        {
          title: "Persuasive challenger",
          interviewLine: "Describe a debate you steered…",
          cvLine: "Challenged [assumption] to unlock [outcome].",
          teamLine: "I push for clarity in discussions.",
        },
      ],
    }),
    entry({
      id: "combo-Ehigh-Alow-soft",
      key: "E:high+A:low",
      variant: "soft",
    }),
    entry({
      id: "C-mid-firm",
      key: "C:mid",
      variant: "firm",
      watchOuts: [],
    }),
    entry({ id: "fallback-mid", key: "fallback:mid", variant: "firm", watchOuts: [] }),
  ],
};

describe("selectInsights", () => {
  it("is deterministic for the same scores", () => {
    const traits = [
      score("E", { slider: 0.8, level: "high", pHigh: 0.8, pMid: 0.1, pLow: 0.1 }),
      score("A", { slider: -0.7, level: "low", pLow: 0.75, pMid: 0.15, pHigh: 0.1 }),
      score("C", { slider: 0.1, level: "mid", confidence: "unclear", pMid: 0.4 }),
      score("ES", { slider: 0.05, level: "mid", confidence: "unclear", pMid: 0.4 }),
      score("O", { slider: -0.05, level: "mid", confidence: "unclear", pMid: 0.4 }),
    ];
    const a = selectInsights(traits, library);
    const b = selectInsights(traits, library);
    expect(a).toEqual(b);
    expect(a.shownEntryIds).toContain("combo-Ehigh-Alow-firm");
  });

  it("never produces watch-outs from unclear traits", () => {
    const traits = CORE_TRAIT_IDS.map((id) =>
      score(id, {
        confidence: "unclear",
        level: "high",
        pHigh: 0.4,
        pMid: 0.3,
        pLow: 0.3,
        slider: 0.2,
      }),
    );
    const selected = selectInsights(traits, library);
    expect(selected.fallback).toBe(true);
    expect(selected.watchOuts).toHaveLength(0);
    expect(selected.goDeeperPrompt).toBe(true);
  });

  it("pairs every watch-out with a strength from the same entry", () => {
    for (const e of library.entries) {
      if (e.watchOuts.length > 0) {
        expect(e.strengths.length).toBeGreaterThan(0);
      }
    }
  });

  it("excludes draft entries when drafts are disallowed", () => {
    const filtered = filterInsightLibrary(library, { allowDrafts: false });
    expect(filtered.entries).toHaveLength(0);
  });

  it("keeps drafts when allowDrafts is true", () => {
    const filtered = filterInsightLibrary(library, { allowDrafts: true });
    expect(filtered.entries.length).toBe(library.entries.length);
  });
});
