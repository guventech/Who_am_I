import { cholesky, logSumExp, matVec } from "./math";
import { logLikItem } from "./grm";
import type {
  AnsweredItem,
  Item,
  ItemBank,
  ModelVersion,
  PosteriorSummary,
  ResponseValue,
} from "./types";

const DIM = 5;
/**
 * Physicist's Gauss–Hermite nodes/weights for ∫ f(x) e^{-x²} dx.
 * For E_{Z~N(0,1)}[f(Z)]: use z = √2 x and weight w/√π.
 */
const GH_PHYS_NODES = [
  -3.6684701415693957, -2.7832900997816495, -2.0259480158257555,
  -1.3265576484414955, -0.6568095668899325, 0, 0.6568095668899325,
  1.3265576484414955, 2.0259480158257555, 2.7832900997816495,
  3.6684701415693957,
] as const;

const GH_PHYS_WEIGHTS = [
  4.31065263071832e-6, 7.58070934412057e-4, 0.0191115805007703,
  0.135483702980266, 0.344642334932019, 0.411213514021857, 0.344642334932019,
  0.135483702980266, 0.0191115805007703, 7.58070934412057e-4,
  4.31065263071832e-6,
] as const;

const SQRT2 = Math.SQRT2;
const INV_SQRT_PI = 1 / Math.sqrt(Math.PI);

const GH_NODES = GH_PHYS_NODES.map((x) => SQRT2 * x);
const GH_WEIGHTS = GH_PHYS_WEIGHTS.map((w) => w * INV_SQRT_PI);

export type ScoringGrid = {
  nPoints: number;
  /** Flattened theta coords: length nPoints * DIM. */
  thetas: Float64Array;
  /** Log prior weights (GH product). */
  logPrior: Float64Array;
};

let cachedGridKey: string | null = null;
let cachedGrid: ScoringGrid | null = null;

function priorKey(priorCov: number[]): string {
  return priorCov.map((x) => x.toFixed(8)).join(",");
}

export function buildGrid(priorCov: number[], nodesPerDim = 11): ScoringGrid {
  const key = `${nodesPerDim}|${priorKey(priorCov)}`;
  if (cachedGrid && cachedGridKey === key) return cachedGrid;

  const nodes = nodesPerDim === 11 ? GH_NODES : gaussHermiteNodes(nodesPerDim);
  const weights =
    nodesPerDim === 11 ? GH_WEIGHTS : gaussHermiteWeights(nodesPerDim);

  const L = cholesky(priorCov, DIM);
  const nPoints = nodesPerDim ** DIM;
  const thetas = new Float64Array(nPoints * DIM);
  const logPrior = new Float64Array(nPoints);

  const idx = new Array(DIM).fill(0) as number[];
  for (let g = 0; g < nPoints; g++) {
    let rem = g;
    for (let d = DIM - 1; d >= 0; d--) {
      idx[d] = rem % nodesPerDim;
      rem = Math.floor(rem / nodesPerDim);
    }
    const z = idx.map((i) => nodes[i]!);
    const theta = matVec(L, z, DIM);
    for (let d = 0; d < DIM; d++) {
      thetas[g * DIM + d] = theta[d]!;
    }
    let logW = 0;
    for (let d = 0; d < DIM; d++) {
      logW += Math.log(weights[idx[d]!]!);
    }
    logPrior[g] = logW;
  }

  cachedGrid = { nPoints, thetas, logPrior };
  cachedGridKey = key;
  return cachedGrid;
}

function gaussHermiteNodes(n: number): number[] {
  if (n === 9) {
    const phys = [
      -3.1909932017815277, -2.266580584531843, -1.468553289216668,
      -0.723551018752837, 0, 0.723551018752837, 1.468553289216668,
      2.266580584531843, 3.1909932017815277,
    ];
    return phys.map((x) => SQRT2 * x);
  }
  throw new Error(`Gauss-Hermite nodes not tabulated for n=${n}`);
}

function gaussHermiteWeights(n: number): number[] {
  if (n === 9) {
    const phys = [
      3.960697726326e-5, 0.0049436242755, 0.0884745273944, 0.43265120804,
      0.720235215606, 0.43265120804, 0.0884745273944, 0.0049436242755,
      3.960697726326e-5,
    ];
    return phys.map((w) => w * INV_SQRT_PI);
  }
  throw new Error(`Gauss-Hermite weights not tabulated for n=${n}`);
}

export function initialLogPosterior(grid: ScoringGrid): Float64Array {
  return new Float64Array(grid.logPrior);
}

export function addItemLikelihood(
  grid: ScoringGrid,
  logPost: Float64Array,
  item: Item,
  response: ResponseValue,
): void {
  const { thetas, nPoints } = grid;
  const theta = new Array(DIM) as number[];
  for (let g = 0; g < nPoints; g++) {
    for (let d = 0; d < DIM; d++) {
      theta[d] = thetas[g * DIM + d]!;
    }
    logPost[g]! += logLikItem(item, theta, response);
  }
}

export function summarizePosterior(grid: ScoringGrid, logPost: Float64Array): PosteriorSummary {
  const { thetas, nPoints } = grid;
  const lse = logSumExp(logPost);
  const mean = new Array(DIM).fill(0) as number[];
  const cov = new Array(DIM * DIM).fill(0) as number[];

  const w = new Float64Array(nPoints);
  for (let g = 0; g < nPoints; g++) {
    w[g] = Math.exp(logPost[g]! - lse);
    for (let d = 0; d < DIM; d++) {
      mean[d]! += w[g]! * thetas[g * DIM + d]!;
    }
  }

  for (let g = 0; g < nPoints; g++) {
    for (let i = 0; i < DIM; i++) {
      const di = thetas[g * DIM + i]! - mean[i]!;
      for (let j = 0; j < DIM; j++) {
        const dj = thetas[g * DIM + j]! - mean[j]!;
        cov[i * DIM + j]! += w[g]! * di * dj;
      }
    }
  }

  const sd = mean.map((_, i) => Math.sqrt(Math.max(cov[i * DIM + i]!, 0)));
  return { mean, sd, cov };
}

export function scoreResponses(
  bank: ItemBank,
  model: ModelVersion,
  answered: AnsweredItem[],
  nodesPerDim = 11,
): PosteriorSummary {
  const grid = buildGrid(model.priorCov, nodesPerDim);
  const logPost = initialLogPosterior(grid);
  const byId = new Map(bank.items.map((i) => [i.id, i]));
  for (const a of answered) {
    const item = byId.get(a.itemId);
    if (!item) throw new Error(`Unknown item ${a.itemId}`);
    addItemLikelihood(grid, logPost, item, a.value);
  }
  return summarizePosterior(grid, logPost);
}

export function priorSummary(model: ModelVersion): PosteriorSummary {
  const grid = buildGrid(model.priorCov);
  return summarizePosterior(grid, initialLogPosterior(grid));
}

/** Incremental scoring state for adaptive selection. */
export type RunningPosterior = {
  grid: ScoringGrid;
  logPost: Float64Array;
  summary: PosteriorSummary;
};

export function createRunningPosterior(model: ModelVersion): RunningPosterior {
  const grid = buildGrid(model.priorCov);
  const logPost = initialLogPosterior(grid);
  return {
    grid,
    logPost,
    summary: summarizePosterior(grid, logPost),
  };
}

export function updateRunningPosterior(
  running: RunningPosterior,
  item: Item,
  response: ResponseValue,
): PosteriorSummary {
  addItemLikelihood(running.grid, running.logPost, item, response);
  running.summary = summarizePosterior(running.grid, running.logPost);
  return running.summary;
}

export function itemById(bank: ItemBank, id: string): Item {
  const item = bank.items.find((i) => i.id === id);
  if (!item) throw new Error(`Unknown item ${id}`);
  return item;
}
