import type { TraitId, TraitScore } from "@/engine/types";
import type {
  InsightEntry,
  InsightLibrary,
  SelectedInsights,
  SelectedImprove,
  SelectedStrength,
  SelectedWatchOut,
  SelectedWorkWith,
} from "./types";

const FALLBACK_KEY = "fallback:mid";
const CAP = 3;

type ConfidentTrait = {
  score: TraitScore;
  soft: boolean;
};

/**
 * Select personal insights from scored traits (§9.3).
 * Deterministic for the same trait scores and library.
 */
export function selectInsights(
  traits: TraitScore[],
  library: InsightLibrary,
): SelectedInsights {
  const byKeyVariant = indexLibrary(library);
  const confident = traits
    .filter((t) => t.confidence !== "unclear")
    .map(
      (score): ConfidentTrait => ({
        score,
        soft: score.confidence === "soft",
      }),
    )
    .sort((a, b) => Math.abs(b.score.slider) - Math.abs(a.score.slider));

  const top = confident.slice(0, CAP);

  if (top.length === 0) {
    return fallbackSelection(byKeyVariant);
  }

  const shown = new Set<string>();
  const strengths: SelectedStrength[] = [];
  const watchOuts: SelectedWatchOut[] = [];
  const improve: SelectedImprove[] = [];
  const workWithOthers: SelectedWorkWith[] = [];
  const tradeOffsByTrait: Partial<Record<TraitId, string>> = {};

  // Combos first (both traits confident with matching levels)
  for (const combo of matchCombos(top, byKeyVariant)) {
    absorbEntry(combo.entry, combo.soft, shown, strengths, watchOuts, improve, workWithOthers);
  }

  // Single-trait fill for top confident traits
  for (const c of top) {
    const key = `${c.score.traitId}:${c.score.level}`;
    const variant = c.soft ? "soft" : "firm";
    const entry =
      byKeyVariant.get(`${key}|${variant}`) ??
      byKeyVariant.get(`${key}|firm`) ??
      byKeyVariant.get(`${key}|soft`);
    if (!entry) continue;
    absorbEntry(entry, c.soft || entry.variant === "soft", shown, strengths, watchOuts, improve, workWithOthers);
    if (entry.tradeOff) {
      tradeOffsByTrait[c.score.traitId] = entry.tradeOff;
    }
  }

  return {
    shownEntryIds: [...shown],
    strengths: strengths.slice(0, CAP),
    watchOuts: watchOuts.slice(0, CAP),
    improve: improve.slice(0, CAP),
    workWithOthers: workWithOthers.slice(0, CAP),
    tradeOffsByTrait,
    fallback: false,
    goDeeperPrompt: false,
  };
}

function fallbackSelection(
  byKeyVariant: Map<string, InsightEntry>,
): SelectedInsights {
  const entry =
    byKeyVariant.get(`${FALLBACK_KEY}|firm`) ??
    byKeyVariant.get(`${FALLBACK_KEY}|soft`);

  if (!entry) {
    return {
      shownEntryIds: [],
      strengths: [],
      watchOuts: [],
      improve: [],
      workWithOthers: [],
      tradeOffsByTrait: {},
      fallback: true,
      goDeeperPrompt: true,
    };
  }

  const strengths: SelectedStrength[] = entry.strengths.map((s) => ({
    ...s,
    entryId: entry.id,
    soft: true,
  }));

  return {
    shownEntryIds: [entry.id],
    strengths: strengths.slice(0, CAP),
    watchOuts: [],
    improve: entry.improve.slice(0, CAP).map((i) => ({
      ...i,
      entryId: entry.id,
      soft: true,
    })),
    workWithOthers: entry.workWithOthers
      ? [{ text: entry.workWithOthers, entryId: entry.id, soft: true }]
      : [],
    tradeOffsByTrait: {},
    fallback: true,
    goDeeperPrompt: true,
  };
}

function indexLibrary(library: InsightLibrary): Map<string, InsightEntry> {
  const map = new Map<string, InsightEntry>();
  for (const e of library.entries) {
    map.set(`${e.key}|${e.variant}`, e);
  }
  return map;
}

const COMBO_KEYS = [
  "E:high+A:low",
  "E:high+A:high",
  "C:high+O:low",
  "O:high+C:low",
  "E:high+O:high",
] as const;

function matchCombos(
  top: ConfidentTrait[],
  byKeyVariant: Map<string, InsightEntry>,
): { entry: InsightEntry; soft: boolean }[] {
  const byTrait = new Map(top.map((c) => [c.score.traitId, c]));
  const out: { entry: InsightEntry; soft: boolean }[] = [];

  for (const comboKey of COMBO_KEYS) {
    const parts = comboKey.split("+");
    const parsed = parts.map((p) => {
      const [traitId, level] = p.split(":") as [TraitId, string];
      return { traitId, level };
    });
    if (parsed.some((p) => !byTrait.has(p.traitId))) continue;
    if (
      parsed.some((p) => {
        const c = byTrait.get(p.traitId)!;
        return c.score.level !== p.level;
      })
    ) {
      continue;
    }
    const soft = parsed.some((p) => byTrait.get(p.traitId)!.soft);
    const variant = soft ? "soft" : "firm";
    const entry =
      byKeyVariant.get(`${comboKey}|${variant}`) ??
      byKeyVariant.get(`${comboKey}|firm`);
    if (entry) out.push({ entry, soft: soft || entry.variant === "soft" });
  }
  return out;
}

function absorbEntry(
  entry: InsightEntry,
  soft: boolean,
  shown: Set<string>,
  strengths: SelectedStrength[],
  watchOuts: SelectedWatchOut[],
  improve: SelectedImprove[],
  workWithOthers: SelectedWorkWith[],
): void {
  if (shown.has(entry.id)) return;
  shown.add(entry.id);

  for (const s of entry.strengths) {
    if (strengths.length >= CAP) break;
    if (strengths.some((x) => x.title === s.title && x.entryId === entry.id)) continue;
    strengths.push({ ...s, entryId: entry.id, soft });
  }
  for (const w of entry.watchOuts) {
    if (watchOuts.length >= CAP) break;
    watchOuts.push({ text: w, entryId: entry.id, soft });
  }
  for (const i of entry.improve) {
    if (improve.length >= CAP) break;
    improve.push({ ...i, entryId: entry.id, soft });
  }
  if (entry.workWithOthers && workWithOthers.length < CAP) {
    workWithOthers.push({
      text: entry.workWithOthers,
      entryId: entry.id,
      soft,
    });
  }
}
