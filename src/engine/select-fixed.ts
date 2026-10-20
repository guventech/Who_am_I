import { aOptimalGain, shermanMorrisonUpdate } from "./select-gain";
import {
  activeCoreItems,
  filterFeasible,
  lastPrimaries,
} from "./select-constraints";
import type {
  Item,
  ItemBank,
  ItemId,
  ItemSelector,
  ModelVersion,
  Rng,
  SessionState,
} from "./types";
import { CORE_TRAIT_IDS, modelTraitIds } from "./types";
import { createRng } from "./math";

/**
 * Deterministic shuffle of the fixed form with trait interleaving:
 * no more than 2 consecutive same primary trait.
 */
export function shuffleFixedForm(
  order: ItemId[],
  bank: ItemBank,
  seed: number,
): ItemId[] {
  const byId = new Map(bank.items.map((i) => [i.id, i]));
  const rng = createRng(seed);
  const remaining = [...order];
  for (let i = remaining.length - 1; i > 0; i--) {
    const j = rng.int(i + 1);
    [remaining[i], remaining[j]] = [remaining[j]!, remaining[i]!];
  }

  const result: ItemId[] = [];
  const leftover = [...remaining];
  while (leftover.length > 0) {
    const lasts = lastPrimaries(result, byId, 2);
    let pickIndex = 0;
    if (lasts.length >= 2 && lasts[0] === lasts[1]) {
      const blocked = lasts[0];
      const idx = leftover.findIndex(
        (id) => byId.get(id)?.primaryTrait !== blocked,
      );
      pickIndex = idx >= 0 ? idx : 0;
    }
    result.push(leftover.splice(pickIndex, 1)[0]!);
  }
  return result;
}

/** Build a 10-item session order with FIXED_FIRST_ITEM_ID always at Q1. */
export function sessionFixedOrder(
  model: ModelVersion,
  bank: ItemBank,
  seed: number,
): ItemId[] {
  const first = model.config.FIXED_FIRST_ITEM_ID;
  const restSource = model.fixedFormOrder.filter((id) => id !== first);
  const need = 9;
  let rest = shuffleFixedForm(restSource, bank, seed);
  if (rest.length < need) {
    const fillers = shuffleFixedForm(
      activeCoreItems(bank)
        .map((i) => i.id)
        .filter((id) => id !== first && !rest.includes(id)),
      bank,
      seed + 1,
    );
    rest = [...rest, ...fillers].slice(0, need);
  } else {
    rest = rest.slice(0, need);
  }
  return [first, ...rest];
}

export class FixedSelector implements ItemSelector {
  private sessionOrder: ItemId[] | null = null;
  private sessionSeed: number | null = null;

  next(
    state: SessionState,
    bank: ItemBank,
    cfg: ModelVersion,
    rng: Rng,
  ): ItemId | null {
    void rng;
    if (state.answered.length >= 10) return null;

    if (this.sessionSeed !== state.seed || !this.sessionOrder) {
      this.sessionSeed = state.seed;
      this.sessionOrder = sessionFixedOrder(cfg, bank, state.seed);
    }

    return this.sessionOrder[state.answered.length] ?? null;
  }
}

/** Greedy A-optimal fixed form under the population prior. */
export function buildFixedFormOrder(
  bank: ItemBank,
  model: ModelVersion,
  n = 10,
): ItemId[] {
  const byId = new Map(bank.items.map((i) => [i.id, i]));
  const pool = activeCoreItems(bank);
  const first = model.config.FIXED_FIRST_ITEM_ID;
  const chosen: ItemId[] = [first];
  const traitOrder = modelTraitIds(model);
  let S = [...model.priorCov];
  const theta = traitOrder.map(() => 0);
  const firstItem = byId.get(first);
  if (firstItem) {
    S = shermanMorrisonUpdate(S, firstItem, theta, traitOrder);
  }

  while (chosen.length < n) {
    const state: SessionState = {
      seed: 0,
      answered: chosen.map((itemId, order) => ({
        itemId,
        value: 3 as const,
        rtMs: 2000,
        order,
      })),
      usedItemIds: [...chosen],
    };
    const feasible = filterFeasible(pool, state, byId, n, {
      coverageTraits: CORE_TRAIT_IDS,
    }).filter((i) => i.id !== first);
    if (feasible.length === 0) break;

    let best: Item | null = null;
    let bestGain = -Infinity;
    const revSoFar = chosen.reduce(
      (c, id) => c + (byId.get(id)?.keyed === -1 ? 1 : 0),
      0,
    );
    for (const item of feasible) {
      let gain = aOptimalGain(item, S, theta, traitOrder);
      if (chosen.length >= 7 && revSoFar < 3 && item.keyed === -1) {
        gain += 0.01;
      }
      if (gain > bestGain) {
        bestGain = gain;
        best = item;
      }
    }
    if (!best) break;
    chosen.push(best.id);
    S = shermanMorrisonUpdate(S, best, theta, traitOrder);
  }

  return chosen;
}
