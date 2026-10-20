/**
 * SYNTHETIC simulation harness — tests the algorithm, not real-world validity.
 * All output is labelled SYNTHETIC.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  bandFromSd,
  thetaToSlider,
  traitScoresFromPosterior,
} from "../src/engine/bands";
import { sampleResponse } from "../src/engine/grm";
import {
  createRunningPosterior,
  itemById,
  scoreResponses,
  updateRunningPosterior,
} from "../src/engine/grid";
import { loadItemBank, loadModelVersion } from "../src/engine/load-content";
import { cholesky, createRng, matVec, pearson } from "../src/engine/math";
import { AdaptiveSelector } from "../src/engine/select-adaptive";
import { shuffleFixedForm } from "../src/engine/select-fixed";
import { activeCoreItems } from "../src/engine/select-constraints";
import type {
  AnsweredItem,
  Item,
  ItemBank,
  ModelVersion,
  PosteriorSummary,
  SessionState,
  TraitId,
  TraitScore,
} from "../src/engine/types";
import { TRAIT_IDS } from "../src/engine/types";

const N = Number(process.env.SIM_N ?? 40);
const SEED = Number(process.env.SIM_SEED ?? 42);
const OUT = join(process.cwd(), "sim-report.md");

type MethodStats = {
  name: string;
  corr: Record<TraitId, number>;
  meanCorr: number;
  meanCredWidth: number;
  meanRetakeWidth: number;
  credCoverage: number;
  retakeCoverage: number;
  pctUnclear: number;
  pctFirm: number;
};

function drawTheta(L: number[], rng: ReturnType<typeof createRng>): number[] {
  const z = [0, 0, 0, 0, 0].map(() => {
    const u1 = Math.max(rng.next(), 1e-12);
    const u2 = rng.next();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  });
  return matVec(L, z, 5);
}

function answerItem(
  item: Item,
  theta: number[],
  rng: ReturnType<typeof createRng>,
  order: number,
): AnsweredItem {
  return {
    itemId: item.id,
    value: sampleResponse(item, theta, rng.next()),
    rtMs: 1500 + rng.int(2000),
    order,
  };
}

function runFixed(
  bank: ItemBank,
  model: ModelVersion,
  theta: number[],
  seed: number,
  rng: ReturnType<typeof createRng>,
): AnsweredItem[] {
  const order = shuffleFixedForm(model.fixedFormOrder, bank, seed);
  return order.map((id, i) => answerItem(itemById(bank, id), theta, rng, i));
}

function runAdaptive(
  bank: ItemBank,
  model: ModelVersion,
  theta: number[],
  seed: number,
  rng: ReturnType<typeof createRng>,
): { answered: AnsweredItem[]; posterior: PosteriorSummary } {
  const selector = new AdaptiveSelector();
  const running = createRunningPosterior(model);
  selector.setPosterior(running.summary);
  const answered: AnsweredItem[] = [];
  const state: SessionState = { seed, answered, usedItemIds: [] };

  for (let i = 0; i < 10; i++) {
    const id = selector.next(state, bank, model, rng);
    if (!id) break;
    const item = itemById(bank, id);
    const a = answerItem(item, theta, rng, i);
    answered.push(a);
    state.usedItemIds.push(id);
    updateRunningPosterior(running, item, a.value);
    selector.setPosterior(running.summary);
  }
  return { answered, posterior: running.summary };
}

function naiveEstimate(
  bank: ItemBank,
  theta: number[],
  rng: ReturnType<typeof createRng>,
): number[] {
  const byTrait = Object.fromEntries(TRAIT_IDS.map((t) => [t, [] as Item[]])) as Record<
    TraitId,
    Item[]
  >;
  for (const item of activeCoreItems(bank)) {
    byTrait[item.primaryTrait]!.push(item);
  }
  return TRAIT_IDS.map((t) => {
    const picks = byTrait[t]!.slice(0, 2);
    let sum = 0;
    for (const item of picks) {
      const r = sampleResponse(item, theta, rng.next());
      sum += item.keyed * (r - 3);
    }
    return sum / 4;
  });
}

function collectFromCached(
  name: string,
  model: ModelVersion,
  trueThetas: number[][],
  estimates: number[][],
  traitRows: TraitScore[][],
  retakeSliders: number[][],
): MethodStats {
  const corr = {} as Record<TraitId, number>;
  for (let d = 0; d < 5; d++) {
    const t = TRAIT_IDS[d]!;
    corr[t] = pearson(
      trueThetas.map((th) => th[d]!),
      estimates.map((e) => e[d]!),
    );
  }
  const meanCorr = TRAIT_IDS.reduce((s, t) => s + corr[t]!, 0) / 5;

  let credHit = 0;
  let retakeHit = 0;
  let n = 0;
  let credWidth = 0;
  let retakeWidth = 0;
  let unclear = 0;
  let firm = 0;

  for (let i = 0; i < traitRows.length; i++) {
    for (let d = 0; d < 5; d++) {
      const tr = traitRows[i]![d]!;
      const sTrue = thetaToSlider(
        trueThetas[i]![d]!,
        model.normMean[d]!,
        model.normSd[d]!,
      );
      credWidth += tr.credibleHigh - tr.credibleLow;
      retakeWidth += tr.retakeHigh - tr.retakeLow;
      n++;
      if (sTrue >= tr.credibleLow && sTrue <= tr.credibleHigh) credHit++;
      const sRetake = retakeSliders[i]![d]!;
      if (sRetake >= tr.retakeLow && sRetake <= tr.retakeHigh) retakeHit++;
      if (tr.confidence === "unclear") unclear++;
      if (tr.confidence === "firm") firm++;
    }
  }

  return {
    name,
    corr,
    meanCorr,
    meanCredWidth: credWidth / n,
    meanRetakeWidth: retakeWidth / n,
    credCoverage: credHit / n,
    retakeCoverage: retakeHit / n,
    pctUnclear: unclear / n,
    pctFirm: firm / n,
  };
}

/** Search retake multiplier using cached posterior means/SDs (no re-scoring). */
function findRetakeMultiplier(
  model: ModelVersion,
  posts: PosteriorSummary[],
  retakeSliders: number[][],
): number {
  let bestM = model.config.RETAKE_BAND_MULTIPLIER;
  let bestDiff = Infinity;
  for (let m = 1.0; m <= 2.0 + 1e-9; m += 0.05) {
    let hit = 0;
    let n = 0;
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i]!;
      for (let d = 0; d < 5; d++) {
        const band = bandFromSd(
          post.mean[d]!,
          post.sd[d]! * m,
          model.normMean[d]!,
          model.normSd[d]!,
        );
        const s = retakeSliders[i]![d]!;
        if (s >= band.low && s <= band.high) hit++;
        n++;
      }
    }
    const diff = Math.abs(hit / n - 0.68);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestM = m;
    }
  }
  return Math.round(bestM * 100) / 100;
}

function fmt(x: number, d = 3): string {
  return Number.isFinite(x) ? x.toFixed(d) : "n/a";
}

function main(): void {
  console.log(`[sim] SYNTHETIC harness N=${N} seed=${SEED}`);
  const bank = loadItemBank();
  const model = loadModelVersion();
  if (model.fixedFormOrder.length !== 10) {
    console.error("fixedFormOrder missing — run pnpm build-fixed-form first");
    process.exit(1);
  }

  const L = cholesky(model.priorCov, 5);
  const rng = createRng(SEED);

  const trueThetas: number[][] = [];
  const fixedEst: number[][] = [];
  const adaptEst: number[][] = [];
  const naiveEst: number[][] = [];
  const fixedPosts: PosteriorSummary[] = [];
  const adaptPosts: PosteriorSummary[] = [];
  const fixedTraits: TraitScore[][] = [];
  const adaptTraits: TraitScore[][] = [];
  const retakeSlidersFixed: number[][] = [];
  const retakeSlidersAdapt: number[][] = [];

  for (let i = 0; i < N; i++) {
    const theta = drawTheta(L, rng);
    trueThetas.push(theta);
    const seed = (SEED + i * 9973) >>> 0;

    const fa = runFixed(bank, model, theta, seed, rng);
    const fp = scoreResponses(bank, model, fa);
    fixedPosts.push(fp);
    fixedEst.push([...fp.mean]);
    fixedTraits.push(
      traitScoresFromPosterior(fp, model.normMean, model.normSd, model.config, false),
    );

    const fa2 = fa.map((a, order) =>
      answerItem(itemById(bank, a.itemId), theta, rng, order),
    );
    const fp2 = scoreResponses(bank, model, fa2);
    retakeSlidersFixed.push(
      TRAIT_IDS.map((_, d) =>
        thetaToSlider(fp2.mean[d]!, model.normMean[d]!, model.normSd[d]!),
      ),
    );

    const { answered: aa, posterior: ap } = runAdaptive(
      bank,
      model,
      theta,
      seed,
      rng,
    );
    adaptPosts.push(ap);
    adaptEst.push([...ap.mean]);
    adaptTraits.push(
      traitScoresFromPosterior(ap, model.normMean, model.normSd, model.config, false),
    );

    const aa2 = aa.map((a, order) =>
      answerItem(itemById(bank, a.itemId), theta, rng, order),
    );
    const ap2 = scoreResponses(bank, model, aa2);
    retakeSlidersAdapt.push(
      TRAIT_IDS.map((_, d) =>
        thetaToSlider(ap2.mean[d]!, model.normMean[d]!, model.normSd[d]!),
      ),
    );

    naiveEst.push(naiveEstimate(bank, theta, rng));

    if ((i + 1) % 10 === 0) console.log(`[sim] completed ${i + 1}/${N}`);
  }

  const fixedStats = collectFromCached(
    "fixed-10",
    model,
    trueThetas,
    fixedEst,
    fixedTraits,
    retakeSlidersFixed,
  );
  const adaptStats = collectFromCached(
    "adaptive",
    model,
    trueThetas,
    adaptEst,
    adaptTraits,
    retakeSlidersAdapt,
  );

  const naiveCorr = {} as Record<TraitId, number>;
  for (let d = 0; d < 5; d++) {
    const t = TRAIT_IDS[d]!;
    naiveCorr[t] = pearson(
      trueThetas.map((th) => th[d]!),
      naiveEst.map((e) => e[d]!),
    );
  }
  const naiveMean = TRAIT_IDS.reduce((s, t) => s + naiveCorr[t]!, 0) / 5;

  const deltaR = adaptStats.meanCorr - fixedStats.meanCorr;
  const multFit = findRetakeMultiplier(model, fixedPosts, retakeSlidersFixed);

  const lines: string[] = [
    "# SYNTHETIC simulation report",
    "",
    "> **SYNTHETIC** — respondents drawn from the bank's own DEV PLACEHOLDER parameters. This validates the algorithm, not real-world validity.",
    "",
    `- N = ${N}`,
    `- seed = ${SEED}`,
    `- model = \`${model.id}\` (${model.bankStatus})`,
    `- fixed form = ${model.fixedFormOrder.join(", ")}`,
    "",
    "## Correlations (estimate vs true θ)",
    "",
    "| Method | E | A | C | ES | O | Mean |",
    "|---|---:|---:|---:|---:|---:|---:|",
  ];

  for (const s of [adaptStats, fixedStats]) {
    lines.push(
      `| ${s.name} | ${TRAIT_IDS.map((t) => fmt(s.corr[t]!)).join(" | ")} | ${fmt(s.meanCorr)} |`,
    );
  }
  lines.push(
    `| naive-2/trait | ${TRAIT_IDS.map((t) => fmt(naiveCorr[t]!)).join(" | ")} | ${fmt(naiveMean)} |`,
  );
  lines.push("");
  lines.push(`**Adaptive − fixed Δr (mean) = ${fmt(deltaR, 4)}**`);
  lines.push("");
  lines.push("## Bands (slider units) — fixed form");
  lines.push("");
  lines.push("| Metric | Value |");
  lines.push("|---|---:|");
  lines.push(`| Mean credible width | ${fmt(fixedStats.meanCredWidth)} |`);
  lines.push(`| Mean retake width | ${fmt(fixedStats.meanRetakeWidth)} |`);
  lines.push(
    `| Credible coverage (true θ) | ${fmt(fixedStats.credCoverage * 100, 1)}% |`,
  );
  lines.push(
    `| Retake coverage (simulated retake) | ${fmt(fixedStats.retakeCoverage * 100, 1)}% |`,
  );
  lines.push(
    `| Multiplier for ~68% retake coverage | ${fmt(multFit, 2)} (config=${model.config.RETAKE_BAND_MULTIPLIER}) |`,
  );
  lines.push(`| % traits unclear | ${fmt(fixedStats.pctUnclear * 100, 1)}% |`);
  lines.push(`| % traits firm | ${fmt(fixedStats.pctFirm * 100, 1)}% |`);
  lines.push("");
  lines.push("## Bands — adaptive");
  lines.push("");
  lines.push("| Metric | Value |");
  lines.push("|---|---:|");
  lines.push(`| Mean credible width | ${fmt(adaptStats.meanCredWidth)} |`);
  lines.push(`| Mean retake width | ${fmt(adaptStats.meanRetakeWidth)} |`);
  lines.push(`| Credible coverage | ${fmt(adaptStats.credCoverage * 100, 1)}% |`);
  lines.push(`| Retake coverage | ${fmt(adaptStats.retakeCoverage * 100, 1)}% |`);
  lines.push(`| % unclear | ${fmt(adaptStats.pctUnclear * 100, 1)}% |`);
  lines.push(`| % firm | ${fmt(adaptStats.pctFirm * 100, 1)}% |`);
  lines.push("");

  writeFileSync(OUT, lines.join("\n"));
  console.log(`[sim] wrote ${OUT}`);

  const covPct = fixedStats.credCoverage * 100;
  if (covPct < 63 || covPct > 73) {
    console.error(
      `[sim] FAIL: credible coverage ${fmt(covPct, 1)}% outside 63–73%`,
    );
    process.exit(1);
  }
  console.log("[sim] coverage check OK");
}

main();
