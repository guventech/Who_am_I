import type { TraitScore } from "@/engine/types";

export type ColourId = "red" | "yellow" | "green" | "blue";

export type ColourSummaryResult =
  | { kind: "balanced" }
  | {
      kind: "coloured";
      primary: ColourId;
      secondary: ColourId | null;
      energy: number;
      focus: number;
    };

function byId(traits: TraitScore[], id: string): TraitScore | undefined {
  return traits.find((t) => t.traitId === id);
}

function primaryColour(energy: number, focus: number): ColourId {
  if (energy > 0 && focus < 0) return "red";
  if (energy > 0 && focus >= 0) return "yellow";
  if (energy <= 0 && focus >= 0) return "green";
  return "blue";
}

function bandCrossesZero(low: number, high: number): boolean {
  return low < 0 && high > 0;
}

/**
 * SPEC §11 optional 4-colour layer from Extraversion and Focus f = (A − C) / 2.
 * Pure helper; no UI. Call only when ENABLE_COLOURS is true.
 */
export function colourSummary(traits: TraitScore[]): ColourSummaryResult {
  const E = byId(traits, "E");
  const A = byId(traits, "A");
  const C = byId(traits, "C");
  if (!E || !A || !C) return { kind: "balanced" };

  const energy = E.slider;
  const focus = (A.slider - C.slider) / 2;

  // Focus band via interval arithmetic on A and C retake ends.
  const fLow = (A.retakeLow - C.retakeHigh) / 2;
  const fHigh = (A.retakeHigh - C.retakeLow) / 2;
  const eCross = bandCrossesZero(E.retakeLow, E.retakeHigh);
  const fCross = bandCrossesZero(fLow, fHigh);

  if (
    (Math.abs(energy) < 0.2 && Math.abs(focus) < 0.2) ||
    (eCross && fCross)
  ) {
    return { kind: "balanced" };
  }

  const primary = primaryColour(energy, focus);
  let secondary: ColourId | null = null;

  // Secondary when the other side of an axis falls inside that axis's band.
  if (fCross) {
    const flippedFocus = -Math.sign(focus || 1) * Math.max(Math.abs(focus), 0.01);
    const cand = primaryColour(energy, flippedFocus);
    if (cand !== primary) secondary = cand;
  } else if (eCross) {
    const flippedEnergy = -Math.sign(energy || 1) * Math.max(Math.abs(energy), 0.01);
    const cand = primaryColour(flippedEnergy, focus);
    if (cand !== primary) secondary = cand;
  }

  return { kind: "coloured", primary, secondary, energy, focus };
}
