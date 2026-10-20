import { informationWeight, loadingVector } from "./grm";
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
      this.sessionOrder = shuffleFixedForm(cfg.fixedFormOrder, bank, state.seed);
    }

    return this.sessionOrder[state.answered.length] ?? null;
  }
}

function matVec5(M: number[], v: number[]): number[] {
  const out = [0, 0, 0, 0, 0];
  for (let i = 0; i < 5; i++) {
    let s = 0;
    for (let j = 0; j < 5; j++) s += M[i * 5 + j]! * v[j]!;
    out[i] = s;
  }
  return out;
}

function dot5(a: number[], b: number[]): number {
  return (
    a[0]! * b[0]! + a[1]! * b[1]! + a[2]! * b[2]! + a[3]! * b[3]! + a[4]! * b[4]!
  );
}

function aOptimalGain(item: Item, S: number[], theta: number[]): number {
  const a = loadingVector(item);
  const w = informationWeight(item, theta);
  const Sa = matVec5(S, a);
  const aSa = dot5(a, Sa);
  const S2a = matVec5(S, Sa);
  const aS2a = dot5(a, S2a);
  return (w * aS2a) / (1 + w * aSa);
}

function shermanMorrisonUpdate(
  S: number[],
  item: Item,
  theta: number[],
): number[] {
  const a = loadingVector(item);
  const w = informationWeight(item, theta);
  const Sa = matVec5(S, a);
  const aSa = dot5(a, Sa);
  const denom = 1 + w * aSa;
  const out = [...S];
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      out[i * 5 + j]! -= (w * Sa[i]! * Sa[j]!) / denom;
    }
  }
  return out;
}

/** Greedy A-optimal fixed form under the population prior. */
export function buildFixedFormOrder(
  bank: ItemBank,
  model: ModelVersion,
  n = 10,
): ItemId[] {
  const byId = new Map(bank.items.map((i) => [i.id, i]));
  const pool = activeCoreItems(bank);
  const chosen: ItemId[] = [];
  let S = [...model.priorCov];
  const theta = [0, 0, 0, 0, 0];

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
    const feasible = filterFeasible(pool, state, byId, n);
    if (feasible.length === 0) break;

    let best: Item | null = null;
    let bestGain = -Infinity;
    const revSoFar = chosen.reduce(
      (c, id) => c + (byId.get(id)?.keyed === -1 ? 1 : 0),
      0,
    );
    for (const item of feasible) {
      let gain = aOptimalGain(item, S, theta);
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
    S = shermanMorrisonUpdate(S, best, theta);
  }

  return chosen;
}
