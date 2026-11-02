import { copyEn } from "@/copy/en";
import type { ColourSummaryResult } from "@/lib/colourSummary";

/** Shared wording for the on-screen summary and local text export. */
export function colourSummaryCopy(result: ColourSummaryResult) {
  if (result.kind === "unavailable") {
    return { headline: copyEn.colourUnavailable, description: null, uncertainty: null };
  }
  if (result.kind === "balanced") {
    return {
      headline: copyEn.colourBalanced,
      description: null,
      uncertainty: result.bothBandsCrossZero ? copyEn.colourBalancedUncertainty : null,
    };
  }
  const primary = copyEn.colourNames[result.primary];
  const headline = copyEn.colourStrengthLabels[result.strength](primary);
  const secondary = result.secondary
    ? copyEn.colourSecondary(copyEn.colourNames[result.secondary])
    : null;
  return {
    headline: secondary ? `${headline}, ${secondary}` : headline,
    description: copyEn.colourDescriptions[result.primary],
    uncertainty:
      result.strength === "light"
        ? copyEn.colourLightUncertainty
        : result.bothBandsCrossZero
          ? copyEn.colourBandUncertainty
          : null,
  };
}
