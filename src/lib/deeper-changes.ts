import { copyEn } from "@/copy/en";
import { CORE_TRAIT_IDS, type TraitScore } from "@/engine/types";
import { scoreToPhrase } from "@/lib/score-phrase";

// Ignore numerical noise when comparing range widths on the slider scale.
export const RANGE_CHANGE_TOLERANCE = 0.02;

export function deeperChanges(before: TraitScore[], after: TraitScore[]): string[] {
  const lines: string[] = [];
  if (!before.some((t) => t.traitId === "H") && after.some((t) => t.traitId === "H")) {
    lines.push(copyEn.deeperAddedH);
  }
  for (const id of CORE_TRAIT_IDS) {
    const previous = before.find((t) => t.traitId === id);
    const current = after.find((t) => t.traitId === id);
    if (!previous || !current) continue;
    const meta = copyEn.traits[id];
    const oldPhrase = scoreToPhrase(previous.slider, meta.left, meta.right);
    const phrase = scoreToPhrase(current.slider, meta.left, meta.right);
    const delta =
      current.retakeHigh - current.retakeLow - (previous.retakeHigh - previous.retakeLow);
    const range =
      copyEn.deeperRangeWords[
        delta < -RANGE_CHANGE_TOLERANCE
          ? "narrower"
          : delta > RANGE_CHANGE_TOLERANCE
            ? "wider"
            : "similar"
      ];
    lines.push(
      oldPhrase === phrase
        ? copyEn.deeperTraitSimilar(meta.title, range)
        : copyEn.deeperTraitChanged(meta.title, phrase, range),
    );
  }
  return lines;
}
