// @vitest-environment jsdom
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TraitComparison } from "@/components/TraitComparison";
import { TraitCard } from "@/components/TraitCard";
import { copyEn } from "@/copy/en";
import type { TraitScore } from "@/engine/types";

function score(slider: number, low: number, high: number): TraitScore {
  return {
    traitId: "E",
    slider,
    theta: slider,
    sd: 0.4,
    level: "mid",
    confidence: "firm",
    retakeLow: low,
    retakeHigh: high,
    credibleLow: low,
    credibleHigh: high,
    pLow: 0.2,
    pMid: 0.6,
    pHigh: 0.2,
  };
}

function render(before: TraitScore, after: TraitScore) {
  const root = document.createElement("div");
  root.innerHTML = renderToStaticMarkup(
    createElement(TraitComparison, { before, after }),
  );
  return root;
}

function style(root: HTMLElement, id: string) {
  return root.querySelector<HTMLElement>(`[data-testid='${id}']`)!.style;
}

describe("Go deeper visual comparison", () => {
  it("plots the exact original and updated scores and widths on one scale", () => {
    const root = render(score(-0.5, -0.8, 0.2), score(0.3, 0.1, 0.5));
    expect(parseFloat(style(root, "original-dot").left)).toBeCloseTo(25);
    expect(parseFloat(style(root, "updated-dot").left)).toBeCloseTo(65);
    expect(parseFloat(style(root, "original-range").width)).toBeCloseTo(50);
    expect(parseFloat(style(root, "updated-range").width)).toBeCloseTo(20);
    const label = root.querySelector("[role=img]")!.getAttribute("aria-label");
    expect(label).toContain("Original: A bit more reserved");
    expect(label).toContain("Updated: A bit more outgoing");
    expect(label).toContain("Range:");
    expect(root.textContent).toContain(copyEn.deeperOriginal);
    expect(root.textContent).toContain(copyEn.deeperUpdated);
  });

  it("shows identical positions for unchanged results and bounds extremes to the track", () => {
    const unchanged = render(score(0.4, -0.2, 0.7), score(0.4, -0.2, 0.7));
    expect(style(unchanged, "original-dot").left).toBe(
      style(unchanged, "updated-dot").left,
    );
    expect(style(unchanged, "original-range").width).toBe(
      style(unchanged, "updated-range").width,
    );
    const edges = render(score(-1, -2, 2), score(1, -1, 1));
    expect(style(edges, "original-dot").left).toBe("0%");
    expect(style(edges, "updated-dot").left).toBe("100%");
    expect(style(edges, "original-range").width).toBe("100%");
  });

  it("marks a newly added trait without inventing a before result", () => {
    const html = renderToStaticMarkup(
      createElement(TraitCard, {
        traitId: "H",
        score: { ...score(0.3, -0.1, 0.6), traitId: "H" },
        added: true,
      }),
    );
    expect(html).toContain(copyEn.deeperNewTrait);
    expect(html).not.toContain('data-testid="trait-comparison"');
  });
});
