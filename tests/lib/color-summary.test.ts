import { describe, expect, it } from "vitest";
import type { TraitScore } from "@/engine/types";
import { colourSummary } from "@/lib/colourSummary";
import { colourSummaryCopy } from "@/lib/colour-summary-copy";
import { copyEn } from "@/copy/en";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ColourSummary } from "@/components/ColourSummary";

function trait(
  traitId: TraitScore["traitId"],
  slider: number,
  retakeLow = slider - 0.1,
  retakeHigh = slider + 0.1,
): TraitScore {
  return {
    traitId,
    theta: slider,
    sd: 0.3,
    slider,
    retakeLow,
    retakeHigh,
    credibleLow: retakeLow,
    credibleHigh: retakeHigh,
    level: "mid",
    confidence: "firm",
    pLow: 0.2,
    pMid: 0.6,
    pHigh: 0.2,
  };
}

function eac(
  e: number,
  a: number,
  c: number,
  bands?: {
    e?: [number, number];
    a?: [number, number];
    c?: [number, number];
  },
): TraitScore[] {
  return [
    trait("E", e, bands?.e?.[0] ?? e - 0.1, bands?.e?.[1] ?? e + 0.1),
    trait("A", a, bands?.a?.[0] ?? a - 0.1, bands?.a?.[1] ?? a + 0.1),
    trait("C", c, bands?.c?.[0] ?? c - 0.1, bands?.c?.[1] ?? c + 0.1),
  ];
}

describe("colourSummary", () => {
  it("maps red yellow green blue primaries", () => {
    const red = colourSummary(eac(0.5, -0.4, 0.4));
    expect(red.kind).toBe("coloured");
    if (red.kind === "coloured") expect(red.primary).toBe("red");

    const yellow = colourSummary(eac(0.5, 0.4, -0.2));
    expect(yellow.kind).toBe("coloured");
    if (yellow.kind === "coloured") expect(yellow.primary).toBe("yellow");

    const green = colourSummary(eac(-0.5, 0.4, -0.2));
    expect(green.kind).toBe("coloured");
    if (green.kind === "coloured") expect(green.primary).toBe("green");

    const blue = colourSummary(eac(-0.5, -0.4, 0.4));
    expect(blue.kind).toBe("coloured");
    if (blue.kind === "coloured") expect(blue.primary).toBe("blue");
  });

  it("reserves balanced for the centre and points within radius 0.05", () => {
    expect(colourSummary(eac(0, 0, 0)).kind).toBe("balanced");
    expect(colourSummary(eac(0.03, 0.06, 0)).kind).toBe("balanced");
    expect(colourSummary(eac(0.04, 0.08, 0)).kind).toBe("coloured");
  });

  it("keeps the dot's colour when both bands cross zero", () => {
    const r = colourSummary(
      eac(0.4, 0.5, -0.3, {
        e: [-0.2, 0.5],
        a: [-0.2, 0.6],
        c: [-0.5, 0.2],
      }),
    );
    expect(r).toMatchObject({
      kind: "coloured",
      primary: "yellow",
      strength: "strong",
      bothBandsCrossZero: true,
    });
    expect(colourSummaryCopy(r).uncertainty).toBe(copyEn.colourBandUncertainty);
  });

  it("adds a secondary when the focus band crosses 0", () => {
    const r = colourSummary(
      eac(0.6, -0.2, 0.4, {
        e: [0.4, 0.8],
        a: [-0.5, 0.3],
        c: [0.2, 0.5],
      }),
    );
    expect(r.kind).toBe("coloured");
    if (r.kind === "coloured") {
      expect(r.primary).toBe("red");
      expect(r.secondary).toBe("yellow");
    }
  });

  it.each([
    [0.049, "balanced", undefined],
    [0.05, "coloured", "light"],
    [0.199, "coloured", "light"],
    [0.2, "coloured", "leaning"],
    [0.5, "coloured", "leaning"],
    [0.501, "coloured", "strong"],
    [1, "coloured", "strong"],
  ])("classifies distance %s as %s / %s", (energy, kind, strength) => {
    const result = colourSummary(eac(energy as number, 0, 0));
    expect(result.kind).toBe(kind);
    if (result.kind === "coloured") expect(result.strength).toBe(strength);
  });

  it("uses Euclidean distance rather than testing each axis separately", () => {
    expect(colourSummary(eac(0.15, 0.3, 0))).toMatchObject({ strength: "leaning" });
    expect(colourSummary(eac(0.4, 0.8, 0))).toMatchObject({ strength: "strong" });
  });

  it("shows a secondary for a near-zero focus even without a crossing band", () => {
    expect(
      colourSummary(eac(0.4, 0.2, 0, { a: [0.18, 0.22], c: [-0.01, 0.01] })),
    ).toMatchObject({ primary: "yellow", secondary: "red" });
  });

  it("flips energy at exactly zero to the other side of the existing mapping", () => {
    expect(colourSummary(eac(0, 0.8, 0))).toMatchObject({
      primary: "green",
      secondary: "yellow",
    });
    expect(colourSummary(eac(0, 0, 0.8))).toMatchObject({
      primary: "blue",
      secondary: "red",
    });
    expect(colourSummary(eac(0.4, 0, 0))).toMatchObject({
      primary: "yellow",
      secondary: "red",
    });
  });

  it("chooses the nearest qualifying axis when both bands cross", () => {
    const bands = { e: [-0.8, 0.8], a: [-0.8, 0.8], c: [-0.8, 0.8] } as const;
    // Use writable tuples for the existing fixture.
    const wide = {
      e: [...bands.e] as [number, number],
      a: [...bands.a] as [number, number],
      c: [...bands.c] as [number, number],
    };
    expect(colourSummary(eac(0.1, 0.8, 0, wide))).toMatchObject({ secondary: "green" });
    expect(colourSummary(eac(0.4, 0.2, 0, wide))).toMatchObject({ secondary: "red" });
    expect(colourSummary(eac(0.3, 0.6, 0, wide))).toMatchObject({ secondary: "red" });
  });

  it("does not show a secondary for distant axes with non-crossing bands", () => {
    expect(colourSummary(eac(0.6, 0.8, -0.2))).toMatchObject({ secondary: null });
    const exact = eac(0.4, 0.3, 0, { a: [0.28, 0.32], c: [-0.01, 0.01] });
    expect(colourSummary(exact)).toMatchObject({ secondary: null });
  });

  it.each(["E", "A", "C"])("reports unavailable when %s is missing", (missing) => {
    const result = colourSummary(eac(0.4, 0.8, 0.3).filter((t) => t.traitId !== missing));
    expect(result).toEqual({ kind: "unavailable" });
    expect(colourSummaryCopy(result).headline).toBe(copyEn.colourUnavailable);
  });

  it("turns the outgoing, cooperative, organised example into a yellow lean", () => {
    const result = colourSummary(
      eac(0.25, 0.7, 0.3, {
        e: [-0.7, 0.9],
        a: [-0.7, 0.9],
        c: [-0.7, 0.9],
      }),
    );
    expect(result).toMatchObject({
      primary: "yellow",
      strength: "leaning",
      secondary: "red",
    });
    expect(colourSummaryCopy(result).headline).toBe("Leaning yellow, with some red");
  });

  it("only describes light results as a light lean", () => {
    const light = colourSummary(eac(0.1, 0, 0));
    expect(colourSummaryCopy(light).uncertainty).toBe(copyEn.colourLightUncertainty);
    const strong = colourSummary(eac(0.6, 0.8, -0.2));
    expect(colourSummaryCopy(strong).uncertainty).toBeNull();
  });

  it.each([
    [0.1, "Light yellow, close to balanced", "0.4"],
    [0.3, "Leaning yellow", "0.7"],
    [0.6, "Strong yellow", "1"],
  ])(
    "renders strength in words and dot opacity for energy %s",
    (energy, headline, opacity) => {
      const html = renderToStaticMarkup(
        createElement(ColourSummary, { traits: eac(energy as number, 0, 0) }),
      );
      expect(html).toContain(headline);
      expect(html).toContain(`opacity:${opacity}`);
      expect(html).toContain(copyEn.colourStrengthExplanation);
      expect(html).toContain(copyEn.colourDisclaimer);
      expect(html).not.toMatch(/[;—](?=[^<]*<\/p>)/);
    },
  );
});
