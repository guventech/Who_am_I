import { copyEn } from "@/copy/en";
import { ENABLE_COLOURS } from "@/config/flags";
import type { TraitScore } from "@/engine/types";
import { formatResultsPlainText, selectInsightsV1 } from "@/insights/select-v1";
import { colourSummary } from "@/lib/colourSummary";
import { isLessCertain, scoreToPhrase } from "@/lib/score-phrase";

export function resultsText(
  traits: TraitScore[],
  options?: { allowDrafts: boolean },
  changes: string[] = [],
) {
  const lines = traits.map((score) => {
    const meta = copyEn.traits[score.traitId];
    return {
      title: meta?.title ?? score.traitId,
      phrase: meta ? scoreToPhrase(score.slider, meta.left, meta.right) : "",
      lessCertain: isLessCertain(score.retakeLow, score.retakeHigh),
    };
  });
  const text = formatResultsPlainText(
    lines,
    selectInsightsV1(traits, options),
    ENABLE_COLOURS ? colourSummary(traits) : undefined,
  );
  return changes.length
    ? `${text}\n${copyEn.deeperChangesHeading}\n${changes.map((line) => `- ${line}`).join("\n")}\n`
    : text;
}
