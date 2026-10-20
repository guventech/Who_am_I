/** Pure engine types — no React/DOM. */

/** Big Five core traits (10-item sketch). */
export const CORE_TRAIT_IDS = ["E", "A", "C", "ES", "O"] as const;
/** Honesty-Humility — go-deeper model only. */
export const DEEPER_EXTRA_TRAIT_IDS = ["H"] as const;
export const TRAIT_IDS = [...CORE_TRAIT_IDS, ...DEEPER_EXTRA_TRAIT_IDS] as const;
export type CoreTraitId = (typeof CORE_TRAIT_IDS)[number];
export type TraitId = (typeof TRAIT_IDS)[number];

export type ItemId = string;

export type ItemPool = "core" | "deeper";
export type ItemStatus = "active" | "candidate" | "retired";
export type ItemSource = "ipip" | "ipip-hexaco" | "original";
export type BankStatus = "dev-uncalibrated" | "calibrated";

export type Item = {
  id: ItemId;
  pool: ItemPool;
  primaryTrait: TraitId;
  loadings: Partial<Record<TraitId, number>>;
  /** Ordered thresholds b2 < b3 < b4 < b5. */
  thresholds: [number, number, number, number];
  keyed: 1 | -1;
  isAnchor: boolean;
  status: ItemStatus;
  source: ItemSource;
  sourceVerified: boolean;
  version: number;
  /** Candidate secondary loadings are hypotheses, not asserted. */
  secondaryEstimated?: boolean;
};

export type ItemBank = {
  version: number;
  /** DEV PLACEHOLDER parameters until calibration. */
  placeholderNote: string;
  items: Item[];
};

export type TraitMeta = {
  id: TraitId;
  name: string;
  poleLow: string;
  poleHigh: string;
};

export type ModelConfig = {
  RETAKE_BAND_MULTIPLIER: number;
  UNCLEAR_WIDTH: number;
  P_LEVEL_FIRM: number;
  LEVEL_CUT: number;
  DEEPER_SD_TARGET: number;
  /** Min additional items before early SD stop (brief: 12–20). */
  DEEPER_BUDGET_MIN: number;
  /** Max additional items in the go-deeper round (brief: 12–20). */
  DEEPER_BUDGET_MAX: number;
  /** Q1 is identical for every session (core round). */
  FIXED_FIRST_ITEM_ID: ItemId;
  FLAG_BAND_FACTOR: number;
  /**
   * Gauss–Hermite nodes per dimension. Core 5D uses 11; 6D deeper
   * uses fewer (e.g. 7) so the grid stays browser-feasible.
   */
  GRID_NODES_PER_DIM: number;
  ACCURACY_CLAIMS: {
    corrWithLongTest: [number, number] | null;
    retest: number | null;
  };
};

export type ModelVersion = {
  id: string;
  bankStatus: BankStatus;
  traits: TraitMeta[];
  /** Row-major prior covariance, size dim² (DEV PLACEHOLDER). */
  priorCov: number[];
  normSampleId: string;
  normsLabel: string;
  /** Per-trait mean/SD in theta space; length = traits.length. */
  normMean: number[];
  normSd: number[];
  /** SHA-256 hex of EN item text per item id. */
  itemHashes: Record<string, string>;
  /** Precomputed fixed 10-item form (item ids). */
  fixedFormOrder: ItemId[];
  config: ModelConfig;
};

export function modelTraitIds(model: ModelVersion): TraitId[] {
  return model.traits.map((t) => t.id);
}

export function modelDim(model: ModelVersion): number {
  return model.traits.length;
}

/** Dimension inferred from a row-major covariance matrix. */
export function covDim(cov: number[]): number {
  const n = Math.round(Math.sqrt(cov.length));
  if (n * n !== cov.length) {
    throw new Error(`Covariance length ${cov.length} is not a square`);
  }
  return n;
}

export type ResponseValue = 1 | 2 | 3 | 4 | 5;

export type AnsweredItem = {
  itemId: ItemId;
  value: ResponseValue;
  rtMs: number;
  order: number;
};

export type SessionState = {
  seed: number;
  answered: AnsweredItem[];
  /** Item ids already used (including answered). */
  usedItemIds: ItemId[];
};

export type PosteriorSummary = {
  mean: number[];
  sd: number[];
  /** Row-major posterior covariance (dim × dim). */
  cov: number[];
};

export type TraitLevel = "low" | "mid" | "high";
export type LevelConfidence = "firm" | "soft" | "unclear";

export type TraitScore = {
  traitId: TraitId;
  theta: number;
  sd: number;
  slider: number;
  credibleLow: number;
  credibleHigh: number;
  retakeLow: number;
  retakeHigh: number;
  pLow: number;
  pMid: number;
  pHigh: number;
  level: TraitLevel;
  confidence: LevelConfidence;
};

export type QualityFlags = {
  fast: boolean;
  straightline: boolean;
  any: boolean;
};

export type Rng = {
  next(): number;
  int(maxExclusive: number): number;
};

export interface ItemSelector {
  next(
    state: SessionState,
    bank: ItemBank,
    cfg: ModelVersion,
    rng: Rng,
  ): ItemId | null;
}
