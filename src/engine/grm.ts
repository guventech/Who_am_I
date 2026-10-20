import { clampProb, sigmoid } from "./math";
import type { Item, ResponseValue, TraitId } from "./types";
import { TRAIT_IDS } from "./types";

/**
 * Loading vector in trait order E,A,C,ES,O.
 */
export function loadingVector(item: Item): number[] {
  return TRAIT_IDS.map((t) => item.loadings[t] ?? 0);
}

function linearPredictor(item: Item, theta: number[]): number {
  const a = loadingVector(item);
  let linear = 0;
  for (let i = 0; i < a.length; i++) {
    linear += a[i]! * (theta[i] ?? 0);
  }
  return linear;
}

/**
 * pStar[0]=P*(1)=1, pStar[1..4]=P*(2..5), pStar[5]=P*(6)=0.
 */
function survivalProbs(item: Item, theta: number[]): number[] {
  const linear = linearPredictor(item, theta);
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
export function categoryProbs(item: Item, theta: number[]): number[] {
  const pStar = survivalProbs(item, theta);
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
): number {
  const probs = categoryProbs(item, theta);
  return Math.log(clampProb(probs[response - 1]!));
}

/**
 * Scalar Fisher information weight w_i(θ) for multidimensional GRM
 * (item information = w_i a a').
 * w = Σ_k (P*_k' - P*_{k+1}')² / P_k where P*' = P*(1-P*).
 */
export function informationWeight(item: Item, theta: number[]): number {
  const linear = linearPredictor(item, theta);
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
): ResponseValue {
  const probs = categoryProbs(item, theta);
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
