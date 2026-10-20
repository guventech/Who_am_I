import type { TraitId, TraitScore } from "@/engine/types";
import { CORE_TRAIT_IDS } from "@/engine/types";
import { isLessCertain } from "@/lib/score-phrase";
import {
  getInsightEntry,
  INSIGHTS_VERSION,
  type InsightEntryV1,
  type InsightLevel,
} from "./library";

export type SelectedStrengthV1 = {
  entryId: string;
  strength: string;
  interview: string;
  cv: string;
  soft: boolean;
};

export type SelectedWatchOutV1 = {
  entryId: string;
  watchOut: string;
  tips: string[];
  /** True when the line is the hand-written soft form. */
  soft: boolean;
};

export type SelectedInsightsV1 = {
  version: typeof INSIGHTS_VERSION;
  shownEntryIds: string[];
  strengths: SelectedStrengthV1[];
  watchOuts: SelectedWatchOutV1[];
};

function levelFromSlider(s: number): InsightLevel {
  if (s < -0.4) return "low";
  if (s > 0.4) return "high";
  return "mid";
}

type Ranked = {
  score: TraitScore;
  level: InsightLevel;
  lessCertain: boolean;
  entry: InsightEntryV1;
};

/**
 * Selection (copy/UI v2):
 * - level: low s < -0.4, mid -0.4..0.4, high > 0.4
 * - rank by |s|
 * - up to 3 strengths (soft form + tag when less certain)
 * - up to 2 watch-outs from traits that are not less certain
 * - if that set is empty, one watch-out from the strongest trait,
 *   in soft wording when that trait is less certain
 * - mid entries only when fewer than 2 traits are low/high
 */
export function selectInsightsV1(traits: TraitScore[]): SelectedInsightsV1 {
  const core = traits.filter((t) =>
    (CORE_TRAIT_IDS as readonly string[]).includes(t.traitId),
  );

  const ranked: Ranked[] = [];
  for (const score of core) {
    const level = levelFromSlider(score.slider);
    const entry = getInsightEntry(score.traitId as TraitId, level);
    if (!entry) continue;
    ranked.push({
      score,
      level,
      lessCertain: isLessCertain(score.retakeLow, score.retakeHigh),
      entry,
    });
  }

  ranked.sort(
    (a, b) => Math.abs(b.score.slider) - Math.abs(a.score.slider),
  );

  const extremeCount = ranked.filter((r) => r.level !== "mid").length;
  const pool =
    extremeCount >= 2 ? ranked.filter((r) => r.level !== "mid") : ranked;

  const strengths: SelectedStrengthV1[] = [];
  for (const r of pool) {
    if (strengths.length >= 3) break;
    strengths.push({
      entryId: r.entry.id,
      strength: r.lessCertain ? r.entry.strengthSoft : r.entry.strength,
      interview: r.entry.interview,
      cv: r.entry.cv,
      soft: r.lessCertain,
    });
  }

  const watchOuts: SelectedWatchOutV1[] = [];
  for (const r of pool) {
    if (watchOuts.length >= 2) break;
    if (r.lessCertain) continue;
    if (r.level === "mid" && extremeCount >= 2) continue;
    watchOuts.push({
      entryId: r.entry.id,
      watchOut: r.entry.watchOut,
      tips: r.entry.tips,
      soft: false,
    });
  }

  if (watchOuts.length === 0) {
    const source = (pool.length > 0 ? pool : ranked)[0];
    if (source) {
      watchOuts.push({
        entryId: source.entry.id,
        watchOut: source.lessCertain
          ? source.entry.watchOutSoft
          : source.entry.watchOut,
        tips: source.entry.tips,
        soft: source.lessCertain,
      });
    }
  }

  const shownEntryIds = [
    ...new Set([
      ...strengths.map((s) => s.entryId),
      ...watchOuts.map((w) => w.entryId),
    ]),
  ];

  return {
    version: INSIGHTS_VERSION,
    shownEntryIds,
    strengths,
    watchOuts,
  };
}

export function formatResultsPlainText(
  traits: {
    title: string;
    phrase: string;
    num: string;
    lessCertain: boolean;
  }[],
  insights: SelectedInsightsV1,
): string {
  const lines: string[] = [];
  lines.push("Who Am I? - Your results");
  lines.push("");
  for (const t of traits) {
    const less = t.lessCertain ? " (less certain)" : "";
    lines.push(`${t.title}: ${t.phrase} ${t.num}${less}`);
  }
  lines.push("");
  if (insights.strengths.length) {
    lines.push("Your strengths");
    for (const s of insights.strengths) {
      const soft = s.soft ? " (less certain)" : "";
      lines.push(`- ${s.strength}${soft}`);
      lines.push(`  Interview: ${s.interview}`);
      lines.push(`  CV: ${s.cv}`);
    }
    lines.push("");
  }
  if (insights.watchOuts.length) {
    lines.push("Watch out for");
    for (const w of insights.watchOuts) {
      const soft = w.soft ? " (less certain)" : "";
      lines.push(`- ${w.watchOut}${soft}`);
      for (const tip of w.tips) lines.push(`  • ${tip}`);
    }
  }
  return lines.join("\n").trimEnd() + "\n";
}
