import { clampProb, sigmoid } from "./math";
import type { Item, ResponseValue, TraitId } from "./types";
import { CORE_TRAIT_IDS } from "./types";

/**
 * Loading vector in the given trait order (defaults to Big Five).
 */
export function loadingVector(
  item: Item,
  traitOrder: readonly TraitId[] = CORE_TRAIT_IDS,
): number[] {
  return traitOrder.map((t) => item.loadings[t] ?? 0);
}

function linearPredictor(
  item: Item,
  theta: number[],
  traitOrder: readonly TraitId[],
): number {
  const a = loadingVector(item, traitOrder);
  let linear = 0;
  for (let i = 0; i < a.length; i++) {
    linear += a[i]! * (theta[i] ?? 0);
  }
  return linear;
}

/**
 * pStar[0]=P*(1)=1, pStar[1..4]=P*(2..5), pStar[5]=P*(6)=0.
 */
function survivalProbs(
  item: Item,
  theta: number[],
  traitOrder: readonly TraitId[],
): number[] {
  const linear = linearPredictor(item, theta, traitOrder);
  return [
    1,
    sigmoid(linear - item.thresholds[0]!),
    sigmoid(linear - item.thresholds[1]!),
    sigmoid(linear - item.thresholds[2]!),
    sigmoid(linear - item.thresholds[3]!),
    0,
  ];
}

/**
 * Category probabilities for a GRM item at theta.
 * P*(X >= k | θ) = sigmoid(a·θ - b_k) for k=2..5; P(X=k)=P*(k)-P*(k+1).
 */
export function categoryProbs(
  item: Item,
  theta: number[],
  traitOrder: readonly TraitId[] = CORE_TRAIT_IDS,
): number[] {
  const pStar = survivalProbs(item, theta, traitOrder);
  const probs: number[] = [];
  for (let k = 0; k < 5; k++) {
    probs.push(Math.max(1e-9, pStar[k]! - pStar[k + 1]!));
  }
  const sum = probs.reduce((s, p) => s + p, 0);
  return probs.map((p) => p / sum);
}

export function logLikItem(
  item: Item,
  theta: number[],
  response: ResponseValue,
  traitOrder: readonly TraitId[] = CORE_TRAIT_IDS,
): number {
  return logLikAtLinear(item, linearPredictor(item, theta, traitOrder), response);
}

/** Same category normalization as categoryProbs, without per-grid-point arrays. */
export function logLikAtLinear(
  item: Item,
  linear: number,
  response: ResponseValue,
): number {
  const s2 = sigmoid(linear - item.thresholds[0]!);
  const s3 = sigmoid(linear - item.thresholds[1]!);
  const s4 = sigmoid(linear - item.thresholds[2]!);
  const s5 = sigmoid(linear - item.thresholds[3]!);
  const p1 = Math.max(1e-9, 1 - s2);
  const p2 = Math.max(1e-9, s2 - s3);
  const p3 = Math.max(1e-9, s3 - s4);
  const p4 = Math.max(1e-9, s4 - s5);
  const p5 = Math.max(1e-9, s5);
  const probability =
    response === 1
      ? p1
      : response === 2
        ? p2
        : response === 3
          ? p3
          : response === 4
            ? p4
            : p5;
  return Math.log(clampProb(probability / (p1 + p2 + p3 + p4 + p5)));
}

/**
 * Scalar Fisher information weight w_i(θ) for multidimensional GRM
 * (item information = w_i a a').
 * w = Σ_k (P*_k' - P*_{k+1}')² / P_k where P*' = P*(1-P*).
 */
export function informationWeight(
  item: Item,
  theta: number[],
  traitOrder: readonly TraitId[] = CORE_TRAIT_IDS,
): number {
  const linear = linearPredictor(item, theta, traitOrder);
  const pStar = [
    1,
    sigmoid(linear - item.thresholds[0]!),
    sigmoid(linear - item.thresholds[1]!),
    sigmoid(linear - item.thresholds[2]!),
    sigmoid(linear - item.thresholds[3]!),
    0,
  ];
  const pStarPrime = pStar.map((p, idx) => {
    if (idx === 0 || idx === 5) return 0;
    return p * (1 - p);
  });

  let w = 0;
  for (let k = 0; k < 5; k++) {
    const pk = Math.max(1e-9, pStar[k]! - pStar[k + 1]!);
    const d = pStarPrime[k]! - pStarPrime[k + 1]!;
    w += (d * d) / pk;
  }
  return w;
}

/** Sample a response 1–5 from the GRM at theta (synthetic). */
export function sampleResponse(
  item: Item,
  theta: number[],
  u: number,
  traitOrder: readonly TraitId[] = CORE_TRAIT_IDS,
): ResponseValue {
  const probs = categoryProbs(item, theta, traitOrder);
  let cum = 0;
  for (let k = 0; k < 5; k++) {
    cum += probs[k]!;
    if (u <= cum) return (k + 1) as ResponseValue;
  }
  return 5;
}

export function primaryLoadingSign(item: Item): number {
  const t = item.primaryTrait as TraitId;
  return Math.sign(item.loadings[t] ?? item.keyed);
}
