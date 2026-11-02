import { aOptimalGain } from "./select-gain";
import {
  candidateItems,
  deeperCandidateItems,
  filterFeasible,
} from "./select-constraints";
import type {
  ItemBank,
  ItemId,
  ItemSelector,
  ModelVersion,
  PosteriorSummary,
  Rng,
  SessionState,
} from "./types";
import { modelTraitIds } from "./types";

/**
 * Short go-deeper schedule (budget ~10):
 * 1) first DEEPER_H_FIRST_COUNT Honesty-Humility items
 * 2) then DEEPER_TIGHTEN_SLOTS non-H items to narrow Big Five ranges
 * 3) top up H until DEEPER_H_MIN_TOTAL if slots remain
 */
export const DEEPER_H_FIRST_COUNT = 2;
export const DEEPER_TIGHTEN_SLOTS = 6;
export const DEEPER_H_MIN_TOTAL = 4;

export type AdaptiveSelectorOptions = {
  /** Total answered items at which selection stops (core = 10). */
  budget: number;
  /** When true, pick from deeper pool + unused core (go-deeper round). */
  deeperRound: boolean;
  /**
   * For deeper rounds: number of answers already present before this round
   * (usually 10). Budget counts only new items when set with deeperRound.
   */
  deeperStartCount?: number;
  /** Deeper only: force the first N picks to primaryTrait H. */
  deeperHFirstCount?: number;
  /** Deeper only: non-H sharpening slots after the H opening. */
  deeperTightenSlots?: number;
  /** Deeper only: aim for at least this many H items by the end. */
  deeperHMinTotal?: number;
};

export class AdaptiveSelector implements ItemSelector {
  private posterior: PosteriorSummary | null = null;
  private readonly opts: AdaptiveSelectorOptions;

  constructor(opts: Partial<AdaptiveSelectorOptions> = {}) {
    this.opts = {
      budget: opts.budget ?? 10,
      deeperRound: opts.deeperRound ?? false,
      deeperStartCount: opts.deeperStartCount,
      deeperHFirstCount: opts.deeperHFirstCount ?? DEEPER_H_FIRST_COUNT,
      deeperTightenSlots: opts.deeperTightenSlots ?? DEEPER_TIGHTEN_SLOTS,
      deeperHMinTotal: opts.deeperHMinTotal ?? DEEPER_H_MIN_TOTAL,
    };
  }

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
    const start = this.opts.deeperRound
      ? (this.opts.deeperStartCount ?? 0)
      : 0;
    const deeperAsked = state.answered.length - start;
    if (this.opts.deeperRound) {
      if (deeperAsked >= this.opts.budget) return null;
    } else if (state.answered.length >= this.opts.budget) {
      return null;
    }

    const byId = new Map(bank.items.map((i) => [i.id, i]));
    const explore = cfg.bankStatus === "calibrated" && rng.next() < 0.1;
    let pool = this.opts.deeperRound
      ? deeperCandidateItems(bank)
      : candidateItems(bank, cfg, explore);

    // Short go-deeper: H open → Big Five tighten → H top-up.
    if (this.opts.deeperRound) {
      const hFirst = this.opts.deeperHFirstCount ?? DEEPER_H_FIRST_COUNT;
      const tighten = this.opts.deeperTightenSlots ?? DEEPER_TIGHTEN_SLOTS;
      const hMin = this.opts.deeperHMinTotal ?? DEEPER_H_MIN_TOTAL;
      const startIdx = this.opts.deeperStartCount ?? 0;
      let hAsked = 0;
      for (let i = startIdx; i < state.answered.length; i++) {
        const it = byId.get(state.answered[i]!.itemId);
        if (it?.primaryTrait === "H") hAsked += 1;
      }
      if (deeperAsked < hFirst) {
        const hOnly = pool.filter((i) => i.primaryTrait === "H");
        if (hOnly.length > 0) pool = hOnly;
      } else if (deeperAsked < hFirst + tighten) {
        const nonH = pool.filter((i) => i.primaryTrait !== "H");
        if (nonH.length > 0) pool = nonH;
      } else if (hAsked < hMin) {
        const hOnly = pool.filter((i) => i.primaryTrait === "H");
        if (hOnly.length > 0) pool = hOnly;
      }
    }

    const feasible = filterFeasible(
      pool,
      state,
      byId,
      this.opts.deeperRound ? state.answered.length + this.opts.budget : 10,
      { enforceCoverage: !this.opts.deeperRound },
    );
    if (feasible.length === 0) return null;

    // Q1 is identical for every core session (brief / review M1).
    if (!this.opts.deeperRound && state.answered.length === 0) {
      return cfg.config.FIXED_FIRST_ITEM_ID;
    }

    const traitOrder = modelTraitIds(cfg);
    const S = this.posterior?.cov ?? cfg.priorCov;
    const theta =
      this.posterior?.mean ?? traitOrder.map(() => 0);

    const ranked = feasible
      .map((item) => ({
        item,
        gain: aOptimalGain(item, S, theta, traitOrder),
      }))
      .sort((a, b) => b.gain - a.gain);

    const top = ranked.slice(0, Math.min(3, ranked.length));
    return top[rng.int(top.length)]!.item.id;
  }
}
