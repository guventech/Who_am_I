/** Config: retake-range width above this marks a trait "less certain". */
export const LESS_CERTAIN_RANGE_WIDTH = 1.0;

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
