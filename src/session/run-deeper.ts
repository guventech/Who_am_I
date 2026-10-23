import { allTraitsMeetSdTarget } from "@/engine/deeper";
import { createRunningPosterior, itemById, updateRunningPosterior } from "@/engine/grid";
import { createRng } from "@/engine/math";
import { scoreSession } from "@/engine/score";
import { AdaptiveSelector } from "@/engine/select-adaptive";
import type {
  AnsweredItem,
  ItemBank,
  ItemId,
  ModelVersion,
  PosteriorSummary,
  ResponseValue,
} from "@/engine/types";
import type { TestSession } from "./run-session";

export type DeeperSession = TestSession & {
  round: "deeper";
  /** Answers from the core 10-item form (immutable for this round). */
  coreAnswered: AnsweredItem[];
  deeperStartCount: number;
};

function posteriorFromAnswers(
  bank: ItemBank,
  deeperModel: ModelVersion,
  answered: AnsweredItem[],
): PosteriorSummary {
  const running = createRunningPosterior(deeperModel);
  for (const a of answered) {
    updateRunningPosterior(running, itemById(bank, a.itemId), a.value);
  }
  return running.summary;
}

export function deeperAsked(session: DeeperSession): number {
  return session.answered.length - session.deeperStartCount;
}

export function beginDeeperSession(
  core: TestSession,
  bank: ItemBank,
  deeperModel: ModelVersion,
): DeeperSession {
  void bank;
  void deeperModel;
  if (!core.completed || !core.scored || core.answered.length < 10) {
    throw new Error("Go deeper requires a completed core session");
  }
  return {
    ...core,
    completionId: crypto.randomUUID(),
    storagePayload: null,
    round: "deeper",
    coreAnswered: [...core.answered],
    deeperStartCount: core.answered.length,
    // Always enter the deeper round; stop rule enforces DEEPER_BUDGET_MIN.
    completed: false,
    scored: null,
    sessionCode: null,
    storageSaved: false,
    storageError: null,
    shownInsightIds: [],
  };
}

export function currentDeeperItemId(
  session: DeeperSession,
  bank: ItemBank,
  deeperModel: ModelVersion,
): ItemId | null {
  if (session.completed) return null;
  const minBudget = deeperModel.config.DEEPER_BUDGET_MIN;
  const budget = deeperModel.config.DEEPER_BUDGET_MAX;
  const asked = deeperAsked(session);
  if (asked >= budget) return null;

  const summary = posteriorFromAnswers(bank, deeperModel, session.answered);
  if (
    asked >= minBudget &&
    allTraitsMeetSdTarget(summary.sd, deeperModel.config.DEEPER_SD_TARGET)
  ) {
    return null;
  }

  const selector = new AdaptiveSelector({
    budget,
    deeperRound: true,
    deeperStartCount: session.deeperStartCount,
  });
  selector.setPosterior(summary);
  const rng = createRng(session.seed + 0xdee9e5 + asked);
  return selector.next(session, bank, deeperModel, rng);
}

export function answerDeeper(
  session: DeeperSession,
  bank: ItemBank,
  deeperModel: ModelVersion,
  value: ResponseValue,
  rtMs: number,
): DeeperSession {
  const itemId = currentDeeperItemId(session, bank, deeperModel);
  if (!itemId) {
    return {
      ...session,
      completed: true,
      scored: scoreSession(bank, deeperModel, session.answered),
    };
  }

  const answered: AnsweredItem = {
    itemId,
    value,
    rtMs,
    order: session.answered.length,
  };
  const next: DeeperSession = {
    ...session,
    answered: [...session.answered, answered],
    usedItemIds: [...session.usedItemIds, itemId],
    completed: false,
    scored: null,
  };

  const minBudget = deeperModel.config.DEEPER_BUDGET_MIN;
  const maxBudget = deeperModel.config.DEEPER_BUDGET_MAX;
  const summary = posteriorFromAnswers(bank, deeperModel, next.answered);
  const met = allTraitsMeetSdTarget(summary.sd, deeperModel.config.DEEPER_SD_TARGET);
  const asked = deeperAsked(next);
  // Brief: stop only after at least MIN items, or when MAX is spent.
  if (asked >= maxBudget || (asked >= minBudget && met)) {
    return {
      ...next,
      completed: true,
      scored: scoreSession(bank, deeperModel, next.answered),
    };
  }
  return next;
}

export function backDeeperOne(session: DeeperSession): DeeperSession {
  if (session.answered.length <= session.deeperStartCount) return session;
  const answered = session.answered.slice(0, -1);
  return {
    ...session,
    answered,
    usedItemIds: answered.map((a) => a.itemId),
    completed: false,
    scored: null,
  };
}

export function isDeeperSession(session: TestSession): session is DeeperSession {
  return (session as DeeperSession).round === "deeper";
}
