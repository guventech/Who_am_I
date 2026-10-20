import { describe, expect, it } from "vitest";
import { formatInsightsAsText } from "@/insights/format-copy";
import type { SelectedInsights } from "@/insights/types";

describe("formatInsightsAsText", () => {
  it("includes strengths and the examples note", () => {
    const selected: SelectedInsights = {
      shownEntryIds: ["E-high-firm"],
      strengths: [
        {
          title: "Outgoing strength",
          interviewLine: "Tell a story…",
          cvLine: "Did [X].",
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
    expect(text).toContain("Use lines only if they are backed by your real examples.");
    expect(text).toContain("Outgoing strength");
    expect(text).toContain("Interview:");
  });
});
