import { describe, expect, it } from "vitest";
import { filterInsightLibrary } from "@/insights/filter-drafts";
import { loadInsightLibraryFromYaml } from "@/insights/load";
import { selectInsights } from "@/insights/select";
import type { TraitScore } from "@/engine/types";
import { TRAIT_IDS } from "@/engine/types";

describe("insight EN draft library", () => {
  const library = loadInsightLibraryFromYaml();

  it("has 15 trait keys x 2 variants, 5 combos x 2, plus fallback", () => {
    const traitKeys = new Set(
      library.entries
        .filter((e) => /^[A-Z]+:(low|mid|high)$/.test(e.key))
        .map((e) => e.key),
    );
    expect(traitKeys.size).toBe(15);
    const comboKeys = new Set(
      library.entries.filter((e) => e.key.includes("+")).map((e) => e.key),
    );
    expect(comboKeys.size).toBe(5);
    expect(library.entries.some((e) => e.key === "fallback:mid")).toBe(true);
    // 15*2 + 5*2 + 1 fallback = 41
    expect(library.entries).toHaveLength(41);
  });

  it("marks all current entries as draft", () => {
    expect(library.entries.every((e) => e.reviewStatus === "draft")).toBe(true);
  });

  it("pairs every watch-out with at least one strength in the same entry", () => {
    for (const e of library.entries) {
      if (e.watchOuts.length > 0) {
        expect(e.strengths.length).toBeGreaterThan(0);
      }
    }
  });

  it("excludes all drafts from a production-style filter", () => {
    const filtered = filterInsightLibrary(library, { allowDrafts: false });
    expect(filtered.entries).toHaveLength(0);
  });

  it("fallback selection works on the real library", () => {
    const unclear: TraitScore[] = TRAIT_IDS.map((traitId) => ({
      traitId,
      theta: 0,
      sd: 1,
      slider: 0,
      credibleLow: -0.9,
      credibleHigh: 0.9,
      retakeLow: -1,
      retakeHigh: 1,
      pLow: 0.33,
      pMid: 0.34,
      pHigh: 0.33,
      level: "mid",
      confidence: "unclear",
    }));
    const selected = selectInsights(unclear, library);
    expect(selected.fallback).toBe(true);
    expect(selected.watchOuts).toHaveLength(0);
    expect(selected.goDeeperPrompt).toBe(true);
    expect(selected.shownEntryIds).toContain("fallback-mid");
  });
});
