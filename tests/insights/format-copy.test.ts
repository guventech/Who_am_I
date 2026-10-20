import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  aOrAn,
  fillInsightPlaceholders,
  formatInsightsAsText,
  withArticle,
} from "@/insights/format-copy";
import type { SelectedInsights } from "@/insights/types";

describe("aOrAn", () => {
  it("picks an before vowels", () => {
    expect(aOrAn("outgoing")).toBe("an");
    expect(aOrAn("accommodating")).toBe("an");
    expect(aOrAn("organised")).toBe("an");
    expect(aOrAn("reserved")).toBe("a");
  });

  it("withArticle never yields a + vowel", () => {
    for (const w of ["outgoing", "accommodating", "organised", "able"]) {
      expect(withArticle(w)).not.toMatch(/\ba [aeiou]/i);
    }
  });
});

describe("formatInsightsAsText", () => {
  it("includes strengths and the examples note", () => {
    const selected: SelectedInsights = {
      shownEntryIds: ["E-high-firm"],
      strengths: [
        {
          title: "Outgoing strength",
          interviewLine: "Tell a story…",
          cvLine: "Did [context].",
          teamLine: "I tend to…",
          entryId: "E-high-firm",
          soft: false,
        },
      ],
      watchOuts: [],
      improve: [],
      workWithOthers: [],
      tradeOffsByTrait: {},
      fallback: false,
      goDeeperPrompt: false,
    };
    const text = formatInsightsAsText(selected);
    expect(text).toContain(
      "Only use these lines if you have a real example that backs them up.",
    );
    expect(text).toContain("Outgoing strength");
    expect(text).toContain("Interview:");
    expect(text).toContain("(your project)");
    expect(text).not.toContain("[context]");
  });

  it("fillInsightPlaceholders replaces brackets", () => {
    expect(
      fillInsightPlaceholders(
        "Brought an outgoing approach to [context], supporting [result].",
      ),
    ).toBe(
      "Brought an outgoing approach to (your project), supporting (your result).",
    );
  });
});

describe("insight library articles", () => {
  it("bundle text avoids a+vowel article errors", () => {
    const bundle = readFileSync(
      join(process.cwd(), "content/insights/en.bundle.json"),
      "utf8",
    );
    expect(bundle).not.toMatch(/\ba outgoing\b/i);
    expect(bundle).not.toMatch(/\ba accommodating\b/i);
    expect(bundle).not.toMatch(/\ba organised\b/i);
    expect(bundle).not.toMatch(/\ba able\b/i);
    expect(bundle).not.toMatch(/flexible with social energy/i);
  });
});
