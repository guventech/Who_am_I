import type { LevelConfidence } from "@/engine/types";

export function formatSignedSlider(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  if (rounded > 0) return `+${rounded.toFixed(2)}`;
  if (rounded < 0) return rounded.toFixed(2);
  return "0.00";
}

export function traitSliderAriaLabel(opts: {
  traitName: string;
  slider: number;
  poleLow: string;
  poleHigh: string;
  retakeLow: number;
  retakeHigh: number;
  confidence: LevelConfidence;
}): string {
  const poleLow = shortPole(opts.poleLow);
  const poleHigh = shortPole(opts.poleHigh);
  const base = `${opts.traitName}: ${formatSignedSlider(opts.slider)}, between ${poleLow} and ${poleHigh}, likely retake range ${formatSignedSlider(opts.retakeLow)} to ${formatSignedSlider(opts.retakeHigh)}`;
  if (opts.confidence === "unclear") {
    return `${base}; unclear — go deeper recommended`;
  }
  return base;
}

function shortPole(pole: string): string {
  const beforeDash = pole.split("—")[0]?.trim() ?? pole;
  return beforeDash.split(",")[0]?.trim() ?? beforeDash;
}
