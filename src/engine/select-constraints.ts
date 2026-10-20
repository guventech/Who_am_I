import type { Item, ItemBank, ModelVersion, SessionState, TraitId } from "./types";
import { TRAIT_IDS } from "./types";

export function activeCoreItems(bank: ItemBank): Item[] {
  return bank.items.filter(
    (i) => i.pool === "core" && i.status === "active",
  );
}

export function candidateItems(
  bank: ItemBank,
  model: ModelVersion,
  allowExploration: boolean,
): Item[] {
  const core = activeCoreItems(bank);
  if (!allowExploration || model.bankStatus === "dev-uncalibrated") {
    return core;
  }
  const candidates = bank.items.filter(
    (i) => i.pool === "core" && i.status === "candidate",
  );
  return [...core, ...candidates];
}

export function usedSet(state: SessionState): Set<string> {
  return new Set(state.usedItemIds);
}

export function primaryCounts(
  answeredIds: string[],
  byId: Map<string, Item>,
): Record<TraitId, number> {
  const counts = Object.fromEntries(TRAIT_IDS.map((t) => [t, 0])) as Record<
    TraitId,
    number
  >;
  for (const id of answeredIds) {
    const item = byId.get(id);
    if (item) counts[item.primaryTrait]! += 1;
  }
  return counts;
}

export function lastPrimaries(
  answeredIds: string[],
  byId: Map<string, Item>,
  n: number,
): TraitId[] {
  const out: TraitId[] = [];
  for (let i = answeredIds.length - 1; i >= 0 && out.length < n; i--) {
    const item = byId.get(answeredIds[i]!);
    if (item) out.push(item.primaryTrait);
  }
  return out;
}

/**
 * Soft constraints for next item at position `answeredCount` (0-based next index).
 * By Q7 (index 6 answered → picking 7th): each trait >= 1 primary.
 */
export function filterFeasible(
  candidates: Item[],
  state: SessionState,
  byId: Map<string, Item>,
  budget = 10,
): Item[] {
  const used = usedSet(state);
  const answeredIds = state.answered.map((a) => a.itemId);
  const nextIndex = answeredIds.length;
  let pool = candidates.filter((i) => !used.has(i.id));

  const lasts = lastPrimaries(answeredIds, byId, 2);
  if (lasts.length >= 2 && lasts[0] === lasts[1]) {
    const blocked = lasts[0];
    const filtered = pool.filter((i) => i.primaryTrait !== blocked);
    if (filtered.length > 0) pool = filtered;
  }

  // Coverage: ensure each trait appears by Q7
  if (nextIndex < 7) {
    const counts = primaryCounts(answeredIds, byId);
    const missing = TRAIT_IDS.filter((t) => counts[t] === 0);
    const remainingSlots = budget - nextIndex;
    if (missing.length > 0 && remainingSlots <= missing.length) {
      const must = pool.filter((i) => missing.includes(i.primaryTrait));
      if (must.length > 0) pool = must;
    }
  }

  return pool;
}

export function reverseKeyedCount(
  ids: string[],
  byId: Map<string, Item>,
): number {
  return ids.reduce((n, id) => {
    const item = byId.get(id);
    return n + (item && item.keyed === -1 ? 1 : 0);
  }, 0);
}
