import { describe, expect, it } from "vitest";
import {
  allTraitsMeetSdTarget,
  hasLicensedHonestyHumilityItems,
  runDeeperRound,
  syntheticDeeperRespond,
} from "../../src/engine/deeper";
import {
  loadDeeperModelVersion,
  loadItemBank,
  loadItemTextEn,
  loadModelVersion,
} from "../../src/engine/load-content";
import { cholesky, createRng, matVec } from "../../src/engine/math";
import { scoreSession } from "../../src/engine/score";
import { shuffleFixedForm } from "../../src/engine/select-fixed";
import { itemById } from "../../src/engine/grid";
import { sampleResponse } from "../../src/engine/grm";
import type { AnsweredItem } from "../../src/engine/types";
import { CORE_TRAIT_IDS, modelTraitIds } from "../../src/engine/types";

function runCoreFixed(
  seed: number,
  theta5: number[],
): AnsweredItem[] {
  const bank = loadItemBank();
  const model = loadModelVersion();
  const rng = createRng(seed);
  const order = shuffleFixedForm(model.fixedFormOrder, bank, seed);
  return order.map((id, i) => {
    const item = itemById(bank, id);
    return {
      itemId: id,
      value: sampleResponse(item, theta5, rng.next(), CORE_TRAIT_IDS),
      rtMs: 2000,
      order: i,
    };
  });
}

describe("go deeper", () => {
  it("keeps core scores unchanged when the deeper round is skipped", () => {
    const bank = loadItemBank();
    const model = loadModelVersion();
    const answered = runCoreFixed(11, [0.2, -0.1, 0.3, 0, -0.2]);
    const a = scoreSession(bank, model, answered);
    const b = scoreSession(bank, model, answered);
    expect(a.traits.map((t) => t.theta)).toEqual(b.traits.map((t) => t.theta));
    expect(a.traits).toHaveLength(5);
  });

  it("uses a separate 6-trait deeper model including H", () => {
    const deeper = loadDeeperModelVersion();
    expect(deeper.id).toBe("model-v0-dev-deeper");
    expect(modelTraitIds(deeper)).toEqual(["E", "A", "C", "ES", "O", "H"]);
    expect(deeper.priorCov).toHaveLength(36);
    expect(deeper.config.GRID_NODES_PER_DIM).toBe(7);
    cholesky(deeper.priorCov, 6); // PD check
  });

  it("H-H placeholders remain candidate / unlicensed", () => {
    const bank = loadItemBank();
    const en = loadItemTextEn();
    const hh = bank.items.filter((i) => i.primaryTrait === "H");
    expect(hh).toHaveLength(6);
    expect(hh.every((i) => i.status === "candidate" && i.pool === "deeper")).toBe(
      true,
    );
    expect(hasLicensedHonestyHumilityItems(bank, en)).toBe(false);
  });

  it(
    "reaches SD target within budget on SYNTHETIC respondents",
    () => {
      const bank = loadItemBank();
      const coreModel = loadModelVersion();
      const deeper = loadDeeperModelVersion();
      const L = cholesky(deeper.priorCov, 6);
      const rng = createRng(99);
      let hits = 0;
      const N = 6;
      for (let i = 0; i < N; i++) {
        const z = Array.from({ length: 6 }, () => {
          const u1 = Math.max(rng.next(), 1e-12);
          const u2 = rng.next();
          return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        });
        const theta6 = matVec(L, z, 6);
        const seed = 1000 + i;
        const coreAnswered = runCoreFixed(seed, theta6.slice(0, 5));
        // Core path still 5 traits
        expect(scoreSession(bank, coreModel, coreAnswered).traits).toHaveLength(
          5,
        );

        const result = runDeeperRound(
          bank,
          deeper,
          coreAnswered,
          seed,
          syntheticDeeperRespond(bank, deeper, theta6),
        );
        expect(result.itemsAsked).toBeLessThanOrEqual(
          deeper.config.DEEPER_BUDGET_MAX,
        );
        expect(result.scored.traits).toHaveLength(6);
        if (result.stoppedReason === "sd_target") {
          hits++;
          expect(
            allTraitsMeetSdTarget(
              result.scored.traits.map((t) => t.sd),
              deeper.config.DEEPER_SD_TARGET,
            ),
          ).toBe(true);
        }
      }
      expect(hits).toBeGreaterThan(0);
    },
    120_000,
  );
});
