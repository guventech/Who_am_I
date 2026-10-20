/**
 * Config: retake-range width above this marks a trait "less certain".
 * Set above the typical fixed-form retake width (sim mean about 1.17,
 * median about 1.28) so a normal answer pattern tags a minority of traits.
 * Fast answers widen ranges (FLAG_BAND_FACTOR) and tag more, but not every trait.
 */
export const LESS_CERTAIN_RANGE_WIDTH = 1.4;

export function isLessCertain(rangeLow: number, rangeHigh: number): boolean {
  return rangeHigh - rangeLow > LESS_CERTAIN_RANGE_WIDTH;
}

/**
 * Natural comparative for each results pole.
 * One-syllable adjectives use -er ("calmer"), not "more calm".
 */
const POLE_COMPARATIVE: Record<string, string> = {
  reserved: "more reserved",
  outgoing: "more outgoing",
  direct: "more direct",
  cooperative: "more cooperative",
  flexible: "more flexible",
  organised: "more organised",
  sensitive: "more sensitive",
  calm: "calmer",
  practical: "more practical",
  curious: "more curious",
};

function comparative(pole: string): string {
  const key = pole.trim().toLowerCase();
  return POLE_COMPARATIVE[key] ?? `more ${key}`;
}

/**
 * Map slider score s in [-1, 1] to a plain phrase using pole labels.
 */
export function scoreToPhrase(
  s: number,
  leftPole: string,
  rightPole: string,
): string {
  const left = comparative(leftPole);
  const right = comparative(rightPole);
  if (s <= -0.6) return `Much ${left} than most people`;
  if (s <= -0.2) return `A bit ${left} than most people`;
  if (s < 0.2) {
    return "About in the middle. You can be both, depending on the situation";
  }
  if (s < 0.6) return `A bit ${right} than most people`;
  return `Much ${right} than most people`;
}

/** Signed score for the results line. Rounds half-up to 2 decimals; never "-0.00". */
export function formatScoreNumber(s: number): string {
  const rounded = Number(s.toFixed(2));
  if (rounded === 0) return "0.00";
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded.toFixed(2)}`;
}
