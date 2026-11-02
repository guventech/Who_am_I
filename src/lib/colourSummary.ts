import type { TraitScore } from "@/engine/types";

export type ColourId = "red" | "yellow" | "green" | "blue";
export type ColourStrength = "light" | "leaning" | "strong";

// Distances use the existing [-1, 1] slider scale, without normalisation.
export const COLOUR_BALANCED_DISTANCE = 0.05;
export const COLOUR_LIGHT_DISTANCE = 0.2;
export const COLOUR_LEANING_DISTANCE = 0.5;
export const COLOUR_SECONDARY_AXIS_DISTANCE = 0.15;

export type ColourSummaryResult =
  | { kind: "unavailable" }
  | { kind: "balanced"; bothBandsCrossZero: boolean }
  | {
      kind: "coloured";
      primary: ColourId;
      secondary: ColourId | null;
      energy: number;
      focus: number;
      strength: ColourStrength;
      bothBandsCrossZero: boolean;
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
  if (!E || !A || !C) return { kind: "unavailable" };

  const energy = E.slider;
  const focus = (A.slider - C.slider) / 2;

  // Focus band via interval arithmetic on A and C retake ends.
  const fLow = (A.retakeLow - C.retakeHigh) / 2;
  const fHigh = (A.retakeHigh - C.retakeLow) / 2;
  const eCross = bandCrossesZero(E.retakeLow, E.retakeHigh);
  const fCross = bandCrossesZero(fLow, fHigh);

  const bothBandsCrossZero = eCross && fCross;
  const distance = Math.hypot(energy, focus);
  if (distance < COLOUR_BALANCED_DISTANCE) {
    return { kind: "balanced", bothBandsCrossZero };
  }
  const strength: ColourStrength =
    distance < COLOUR_LIGHT_DISTANCE
      ? "light"
      : distance <= COLOUR_LEANING_DISTANCE
        ? "leaning"
        : "strong";

  const primary = primaryColour(energy, focus);
  let secondary: ColourId | null = null;

  const focusClose = Math.abs(focus) < COLOUR_SECONDARY_AXIS_DISTANCE || fCross;
  const energyClose = Math.abs(energy) < COLOUR_SECONDARY_AXIS_DISTANCE || eCross;
  // Flip the closest qualifying axis. Focus wins exact ties.
  if (focusClose && (!energyClose || Math.abs(focus) <= Math.abs(energy))) {
    secondary = primaryColour(energy, focus >= 0 ? -0.01 : 0.01);
  } else if (energyClose) {
    secondary = primaryColour(energy > 0 ? -0.01 : 0.01, focus);
  }

  return {
    kind: "coloured",
    primary,
    secondary,
    energy,
    focus,
    strength,
    bothBandsCrossZero,
  };
}
