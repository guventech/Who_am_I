import { informationWeight, loadingVector } from "./grm";
import type { Item, TraitId } from "./types";
import { covDim } from "./types";

function matVec(M: number[], v: number[], n: number): number[] {
  const out = new Array(n).fill(0) as number[];
  for (let i = 0; i < n; i++) {
    let s = 0;
    for (let j = 0; j < n; j++) s += M[i * n + j]! * v[j]!;
    out[i] = s;
  }
  return out;
}

function dot(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i]! * b[i]!;
  return s;
}

/** A-optimal gain: (w a'S²a) / (1 + w a'Sa). */
export function aOptimalGain(
  item: Item,
  S: number[],
  theta: number[],
  traitOrder: readonly TraitId[],
): number {
  const n = covDim(S);
  const a = loadingVector(item, traitOrder);
  const w = informationWeight(item, theta, traitOrder);
  const Sa = matVec(S, a, n);
  const aSa = dot(a, Sa);
  const S2a = matVec(S, Sa, n);
  const aS2a = dot(a, S2a);
  return (w * aS2a) / (1 + w * aSa);
}

export function shermanMorrisonUpdate(
  S: number[],
  item: Item,
  theta: number[],
  traitOrder: readonly TraitId[],
): number[] {
  const n = covDim(S);
  const a = loadingVector(item, traitOrder);
  const w = informationWeight(item, theta, traitOrder);
  const Sa = matVec(S, a, n);
  const aSa = dot(a, Sa);
  const denom = 1 + w * aSa;
  const out = [...S];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      out[i * n + j]! -= (w * Sa[i]! * Sa[j]!) / denom;
    }
  }
  return out;
}
