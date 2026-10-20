/**
 * Go-deeper round (§5.5): continue from the core posterior on a 6-trait
 * model version, budget 12–20 additional items, stop when every trait SD
 * ≤ DEEPER_SD_TARGET or the budget is spent.
 */
import {
  createRunningPosterior,
  itemById,
  updateRunningPosterior,
} from "./grid";
import { sampleResponse } from "./grm";
import { createRng } from "./math";
import { scoreSession, type ScoredSession } from "./score";
import { AdaptiveSelector } from "./select-adaptive";
import type {
  AnsweredItem,
  ItemBank,
  ItemId,
  ModelVersion,
  ResponseValue,
  Rng,
  SessionState,
} from "./types";
import { modelTraitIds } from "./types";

export function allTraitsMeetSdTarget(
  sd: number[],
  target: number,
): boolean {
  return sd.length > 0 && sd.every((s) => s <= target);
}

export type DeeperRoundResult = {
  /** Answers added during the deeper round only. */
  deeperAnswered: AnsweredItem[];
  /** Core + deeper answers. */
  allAnswered: AnsweredItem[];
  scored: ScoredSession;
  stoppedReason: "sd_target" | "budget";
  itemsAsked: number;
};

/**
 * Run an adaptive go-deeper round starting from core answers.
 * Re-scores on the 6-trait model (never mutates the 5-trait model).
 */
export function runDeeperRound(
  bank: ItemBank,
  deeperModel: ModelVersion,
  coreAnswered: AnsweredItem[],
  seed: number,
  respond: (itemId: ItemId, order: number, rng: Rng) => ResponseValue,
): DeeperRoundResult {
  const minBudget = deeperModel.config.DEEPER_BUDGET_MIN;
  const budget = deeperModel.config.DEEPER_BUDGET_MAX;
  const target = deeperModel.config.DEEPER_SD_TARGET;
  const traitOrder = modelTraitIds(deeperModel);
  if (traitOrder.length !== 6 || !traitOrder.includes("H")) {
    throw new Error("Go-deeper requires a 6-trait model including H");
  }

  const running = createRunningPosterior(deeperModel);
  for (const a of coreAnswered) {
    updateRunningPosterior(running, itemById(bank, a.itemId), a.value);
  }

  const selector = new AdaptiveSelector({
    budget,
    deeperRound: true,
    deeperStartCount: coreAnswered.length,
  });
  selector.setPosterior(running.summary);

  const deeperAnswered: AnsweredItem[] = [];
  const usedItemIds = [
    ...coreAnswered.map((a) => a.itemId),
  ];
  const state: SessionState = {
    seed,
    answered: [...coreAnswered],
    usedItemIds: [...usedItemIds],
  };
  const rng = createRng(seed ^ 0xdee9e5);

  let stoppedReason: "sd_target" | "budget" = "budget";

  for (let i = 0; i < budget; i++) {
    const asked = deeperAnswered.length;
    if (
      asked >= minBudget &&
      allTraitsMeetSdTarget(running.summary.sd, target)
    ) {
      stoppedReason = "sd_target";
      break;
    }
    const id = selector.next(state, bank, deeperModel, rng);
    if (!id) break;
    const item = itemById(bank, id);
    const order = state.answered.length;
    const value = respond(id, order, rng);
    const answer: AnsweredItem = {
      itemId: id,
      value,
      rtMs: 1500 + rng.int(2000),
      order,
    };
    deeperAnswered.push(answer);
    state.answered.push(answer);
    state.usedItemIds.push(id);
    updateRunningPosterior(running, item, value);
    selector.setPosterior(running.summary);

    if (
      deeperAnswered.length >= minBudget &&
      allTraitsMeetSdTarget(running.summary.sd, target)
    ) {
      stoppedReason = "sd_target";
      break;
    }
  }
  if (deeperAnswered.length >= budget) stoppedReason = "budget";

  const allAnswered = [...coreAnswered, ...deeperAnswered];
  const scored = scoreSession(bank, deeperModel, allAnswered);
  return {
    deeperAnswered,
    allAnswered,
    scored,
    stoppedReason,
    itemsAsked: deeperAnswered.length,
  };
}

/** SYNTHETIC helper: sample GRM responses for simulation. */
export function syntheticDeeperRespond(
  bank: ItemBank,
  deeperModel: ModelVersion,
  trueTheta: number[],
): (itemId: ItemId, order: number, rng: Rng) => ResponseValue {
  const traitOrder = modelTraitIds(deeperModel);
  return (itemId, _order, rng) => {
    const item = itemById(bank, itemId);
    return sampleResponse(item, trueTheta, rng.next(), traitOrder);
  };
}

/** True when H-H items are active, IPIP-HEXACO sourced, and not placeholders. */
export function hasVerifiedHonestyHumilityItems(
  bank: ItemBank,
  textEn: Record<string, string>,
): boolean {
  const hh = bank.items.filter(
    (i) =>
      i.pool === "deeper" &&
      i.primaryTrait === "H" &&
      i.status === "active",
  );
  if (hh.length < 6) return false;
  return hh.every((i) => {
    const text = textEn[i.id] ?? "";
    return (
      i.source === "ipip-hexaco" &&
      i.sourceVerified === true &&
      text.length > 0 &&
      !/\[H-H item placeholder/i.test(text)
    );
  });
}
