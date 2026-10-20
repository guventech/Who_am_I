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
};

export class AdaptiveSelector implements ItemSelector {
  private posterior: PosteriorSummary | null = null;
  private readonly opts: AdaptiveSelectorOptions;

  constructor(opts: Partial<AdaptiveSelectorOptions> = {}) {
    this.opts = {
      budget: opts.budget ?? 10,
      deeperRound: opts.deeperRound ?? false,
      deeperStartCount: opts.deeperStartCount,
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
    const pool = this.opts.deeperRound
      ? deeperCandidateItems(bank)
      : candidateItems(bank, cfg, explore);
    const feasible = filterFeasible(
      pool,
      state,
      byId,
      this.opts.deeperRound ? state.answered.length + this.opts.budget : 10,
      { enforceCoverage: !this.opts.deeperRound },
    );
    if (feasible.length === 0) return null;

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

    // First pick in a core session is deterministic; deeper continues from posterior.
    if (!this.opts.deeperRound && state.answered.length === 0) {
      return ranked[0]!.item.id;
    }

    const top = ranked.slice(0, Math.min(3, ranked.length));
    return top[rng.int(top.length)]!.item.id;
  }
}
