import type { AnsweredItem, QualityFlags } from "./types";

export function computeQualityFlags(answered: AnsweredItem[]): QualityFlags {
  const fastCount = answered.filter((a) => a.rtMs < 1000).length;
  const fast = fastCount >= 3;

  let straightline = false;
  if (answered.length >= 8) {
    const counts = new Map<number, number>();
    for (const a of answered) {
      counts.set(a.value, (counts.get(a.value) ?? 0) + 1);
    }
    straightline = [...counts.values()].some((c) => c >= 8);
  }

  return { fast, straightline, any: fast || straightline };
}

export const FLAG_NOTE =
  "Some answers came very quickly — your ranges are widened";
