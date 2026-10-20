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
 * Map slider score s in [-1, 1] to a plain phrase using pole labels.
 */
export function scoreToPhrase(
  s: number,
  leftPole: string,
  rightPole: string,
): string {
  const left = leftPole.toLowerCase();
  const right = rightPole.toLowerCase();
  if (s <= -0.6) return `Much more ${left} than most people`;
  if (s <= -0.2) return `A bit more ${left} than most people`;
  if (s < 0.2) {
    return "About in the middle. You can be both, depending on the situation";
  }
  if (s < 0.6) return `A bit more ${right} than most people`;
  return `Much more ${right} than most people`;
}

export function formatScoreNumber(s: number): string {
  const sign = s > 0 ? "+" : "";
  return `${sign}${s.toFixed(2)}`;
}
