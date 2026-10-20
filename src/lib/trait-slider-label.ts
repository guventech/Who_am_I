import type { LevelConfidence } from "@/engine/types";
import { formatScoreNumber } from "@/lib/score-phrase";

export function formatSignedSlider(value: number): string {
  return formatScoreNumber(value);
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
    return `${base}; unclear - go deeper recommended`;
  }
  return base;
}

function shortPole(pole: string): string {
  const beforeColon = pole.split(":")[0]?.trim() ?? pole;
  return beforeColon.split(",")[0]?.trim() ?? beforeColon;
}
