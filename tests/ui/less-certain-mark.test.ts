import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LessCertainMark } from "@/components/LessCertainMark";
import { TraitCard } from "@/components/TraitCard";
import type { TraitScore } from "@/engine/types";

function score(partial: Pick<TraitScore, "slider" | "retakeLow" | "retakeHigh">): TraitScore {
  return {
    traitId: "ES",
    theta: partial.slider,
    sd: 0.7,
    level: "mid",
    confidence: "firm",
    credibleLow: partial.retakeLow,
    credibleHigh: partial.retakeHigh,
    pLow: 0.2,
    pMid: 0.6,
    pHigh: 0.2,
    ...partial,
  };
}

describe("less certain mark", () => {
  it("renders a space before the tag", () => {
    const html = renderToStaticMarkup(createElement(LessCertainMark));
    expect(html).toContain(" (less certain)");
    expect(html).not.toMatch(/>\(less certain\)/);
  });

  it("shows plain words and a spaced tag on a trait line", () => {
    const html = renderToStaticMarkup(
      createElement(TraitCard, {
        traitId: "ES",
        score: score({ slider: -0.001, retakeLow: -0.9, retakeHigh: 0.8 }),
      }),
    );
    expect(html).toContain("About in the middle");
    expect(html).not.toContain("more calm");
    expect(html).not.toMatch(/>[+-]?\d+\.\d+</);
    expect(html).toContain(" (less certain)");
    expect(html).not.toMatch(/\d\(less certain\)/);
    expect(html).toContain('role="img"');
    expect(html).toContain("Range:");
    expect(html).not.toContain('class="sr-only"');
  });

  it("says calmer, not more calm, on a high calm score", () => {
    const html = renderToStaticMarkup(
      createElement(TraitCard, {
        traitId: "ES",
        score: score({ slider: 0.8, retakeLow: 0.2, retakeHigh: 0.95 }),
      }),
    );
    expect(html).toContain("Clearly calmer.");
    expect(html).not.toContain("more calm");
    expect(html).not.toMatch(/>[+-]?\d+\.\d+</);
  });

  it("is the only tag renderer on trait, strength, and watch-out lines", () => {
    const result = readFileSync(
      join(process.cwd(), "src/app/result/result-client.tsx"),
      "utf8",
    );
    const trait = readFileSync(
      join(process.cwd(), "src/components/TraitCard.tsx"),
      "utf8",
    );
    expect(result).not.toContain("{copyEn.lessCertain}");
    expect(trait).not.toContain("{copyEn.lessCertain}");
    expect(result.match(/<LessCertainMark \/>/g)).toHaveLength(2);
    expect(trait.match(/<LessCertainMark \/>/g)).toHaveLength(1);
  });
});
