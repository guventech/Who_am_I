import { informationWeight, loadingVector } from "./grm";
import {
  candidateItems,
  filterFeasible,
} from "./select-constraints";
import type {
  Item,
  ItemBank,
  ItemId,
  ItemSelector,
  ModelVersion,
  PosteriorSummary,
  Rng,
  SessionState,
} from "./types";

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

/** A-optimal gain: (w a'S²a) / (1 + w a'Sa). */
export function aOptimalGain(
  item: Item,
  S: number[],
  theta: number[],
): number {
  const a = loadingVector(item);
  const w = informationWeight(item, theta);
  const Sa = matVec5(S, a);
  const aSa = dot5(a, Sa);
  const S2a = matVec5(S, Sa);
  const aS2a = dot5(a, S2a);
  return (w * aS2a) / (1 + w * aSa);
}

export class AdaptiveSelector implements ItemSelector {
  private posterior: PosteriorSummary | null = null;

  /** Call after each answer with updated posterior (or null for prior). */
  setPosterior(summary: PosteriorSummary | null): void {
    this.posterior = summary;
  }

  next(
    state: SessionState,
    bank: ItemBank,
    cfg: ModelVersion,
    rng: Rng,
  ): ItemId | null {
    if (state.answered.length >= 10) return null;

    const byId = new Map(bank.items.map((i) => [i.id, i]));
    // Exploration share <= 10% of sessions when calibrated
    const explore = cfg.bankStatus === "calibrated" && rng.next() < 0.1;
    const pool = candidateItems(bank, cfg, explore);
    const feasible = filterFeasible(pool, state, byId, 10);
    if (feasible.length === 0) return null;

    const S = this.posterior?.cov ?? cfg.priorCov;
    const theta = this.posterior?.mean ?? [0, 0, 0, 0, 0];

    const ranked = feasible
      .map((item) => ({ item, gain: aOptimalGain(item, S, theta) }))
      .sort((a, b) => b.gain - a.gain);

    // Q1 deterministic: top item at prior
    if (state.answered.length === 0) {
      return ranked[0]!.item.id;
    }

    const top = ranked.slice(0, Math.min(3, ranked.length));
    return top[rng.int(top.length)]!.item.id;
  }
}
