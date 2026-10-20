import { invPhi, phi } from "./math";
import type {
  LevelConfidence,
  ModelConfig,
  TraitId,
  TraitLevel,
  TraitScore,
} from "./types";
import { TRAIT_IDS } from "./types";
import type { PosteriorSummary } from "./types";

/** Map theta to slider [-1,1] vs norm sample. */
export function thetaToSlider(
  theta: number,
  muNorm: number,
  sdNorm: number,
): number {
  const z = (theta - muNorm) / sdNorm;
  return 2 * phi(z) - 1;
}

export function bandFromSd(
  theta: number,
  sd: number,
  muNorm: number,
  sdNorm: number,
): { low: number; high: number } {
  const z = (theta - muNorm) / sdNorm;
  const sdZ = sd / sdNorm;
  return {
    low: 2 * phi(z - sdZ) - 1,
    high: 2 * phi(z + sdZ) - 1,
  };
}

/**
 * Level cut points in theta space: ± Φ⁻¹((1 + LEVEL_CUT)/2).
 * With LEVEL_CUT=0.40 → ≈ ±0.524.
 */
export function levelCuts(levelCut: number): { low: number; high: number } {
  const p = (1 + levelCut) / 2;
  const c = invPhi(p);
  return { low: -c, high: c };
}

export function levelProbabilities(
  theta: number,
  sd: number,
  levelCut: number,
): { pLow: number; pMid: number; pHigh: number } {
  const { low, high } = levelCuts(levelCut);
  const s = Math.max(sd, 1e-6);
  const pLow = phi((low - theta) / s);
  const pHigh = 1 - phi((high - theta) / s);
  const pMid = Math.max(0, 1 - pLow - pHigh);
  const sum = pLow + pMid + pHigh;
  return { pLow: pLow / sum, pMid: pMid / sum, pHigh: pHigh / sum };
}

export function classifyLevel(
  pLow: number,
  pMid: number,
  pHigh: number,
  credibleWidth: number,
  cfg: ModelConfig,
): { level: TraitLevel; confidence: LevelConfidence } {
  const entries: { level: TraitLevel; p: number }[] = [
    { level: "low", p: pLow },
    { level: "mid", p: pMid },
    { level: "high", p: pHigh },
  ];
  entries.sort((a, b) => b.p - a.p);
  const best = entries[0]!;
  if (best.p < 0.5 || credibleWidth > cfg.UNCLEAR_WIDTH) {
    return { level: best.level, confidence: "unclear" };
  }
  if (best.p >= cfg.P_LEVEL_FIRM) {
    return { level: best.level, confidence: "firm" };
  }
  return { level: best.level, confidence: "soft" };
}

export function traitScoresFromPosterior(
  posterior: PosteriorSummary,
  normMean: number[],
  normSd: number[],
  cfg: ModelConfig,
  flagWiden: boolean,
): TraitScore[] {
  const bandFactor = flagWiden ? cfg.FLAG_BAND_FACTOR : 1;
  return TRAIT_IDS.map((traitId: TraitId, i) => {
    const theta = posterior.mean[i]!;
    const sd = posterior.sd[i]!;
    const mu = normMean[i]!;
    const ns = normSd[i]!;
    const slider = thetaToSlider(theta, mu, ns);
    const credible = bandFromSd(theta, sd, mu, ns);
    const retake = bandFromSd(
      theta,
      sd * cfg.RETAKE_BAND_MULTIPLIER * bandFactor,
      mu,
      ns,
    );
    const { pLow, pMid, pHigh } = levelProbabilities(theta, sd, cfg.LEVEL_CUT);
    const credibleWidth = credible.high - credible.low;
    const { level, confidence } = classifyLevel(
      pLow,
      pMid,
      pHigh,
      credibleWidth,
      cfg,
    );
    return {
      traitId,
      theta,
      sd,
      slider,
      credibleLow: credible.low,
      credibleHigh: credible.high,
      retakeLow: retake.low,
      retakeHigh: retake.high,
      pLow,
      pMid,
      pHigh,
      level,
      confidence,
    };
  });
}
