import { describe, expect, it } from "vitest";
import {
  isLessCertain,
  LESS_CERTAIN_RANGE_WIDTH,
  scoreToPhrase,
} from "@/lib/score-phrase";

describe("scoreToPhrase", () => {
  it("maps band edges", () => {
    expect(scoreToPhrase(-0.6, "Reserved", "Outgoing")).toBe(
      "Much more reserved than most people",
    );
    expect(scoreToPhrase(-0.2, "Reserved", "Outgoing")).toBe(
      "A bit more reserved than most people",
    );
    expect(scoreToPhrase(0.2, "Reserved", "Outgoing")).toBe(
      "A bit more outgoing than most people",
    );
    expect(scoreToPhrase(0.6, "Reserved", "Outgoing")).toBe(
      "Much more outgoing than most people",
    );
    expect(scoreToPhrase(0, "Reserved", "Outgoing")).toContain(
      "About in the middle",
    );
  });
});

describe("isLessCertain", () => {
  it("uses LESS_CERTAIN_RANGE_WIDTH", () => {
    expect(LESS_CERTAIN_RANGE_WIDTH).toBe(1.0);
    expect(isLessCertain(-0.5, 0.5)).toBe(false); // width 1.0
    expect(isLessCertain(-0.505, 0.505)).toBe(true); // width 1.01
  });
});
