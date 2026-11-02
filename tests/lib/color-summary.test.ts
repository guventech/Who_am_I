import { describe, expect, it } from "vitest";
import type { TraitScore } from "@/engine/types";
import { colourSummary } from "@/lib/colourSummary";

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

  it("returns balanced when both |E| and |f| are below 0.2", () => {
    expect(colourSummary(eac(0.1, 0.1, 0.05))).toEqual({ kind: "balanced" });
  });

  it("returns balanced when both energy and focus bands cross 0", () => {
    const r = colourSummary(
      eac(0.4, 0.5, -0.3, {
        e: [-0.2, 0.5],
        a: [-0.2, 0.6],
        c: [-0.5, 0.2],
      }),
    );
    expect(r.kind).toBe("balanced");
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
});
