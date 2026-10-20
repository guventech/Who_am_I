import { describe, expect, it } from "vitest";
import { accuracySentenceFromClaims } from "@/lib/accuracy-copy";

describe("accuracySentenceFromClaims", () => {
  it("returns null when claims are empty (dev model)", () => {
    expect(
      accuracySentenceFromClaims({
        corrWithLongTest: null,
        retest: null,
      }),
    ).toBeNull();
  });

  it("includes only numbers supplied by claims", () => {
    const sentence = accuracySentenceFromClaims({
      corrWithLongTest: [0.6, 0.75],
      retest: 0.7,
    });
    expect(sentence).toContain("0.60");
    expect(sentence).toContain("0.75");
    expect(sentence).toContain("0.70");
    expect(sentence).not.toMatch(/0\.85|0\.90/);
  });
});
