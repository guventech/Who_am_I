import { createRng } from "@/engine/math";
import { scoreSession, type ScoredSession } from "@/engine/score";
import { FixedSelector } from "@/engine/select-fixed";
import type {
  AnsweredItem,
  ItemBank,
  ItemId,
  ModelVersion,
  ResponseValue,
  SessionState,
} from "@/engine/types";

export type TestSession = SessionState & {
  completed: boolean;
  scored: ScoredSession | null;
  /** Set after a consented save; plaintext shown once. */
  sessionCode: string | null;
  storageSaved: boolean;
  storageError: string | null;
  shownInsightIds: string[];
  startDay: string;
};

export function createSession(seed = Date.now()): TestSession {
  return {
    seed,
    answered: [],
    usedItemIds: [],
    completed: false,
    scored: null,
    sessionCode: null,
    storageSaved: false,
    storageError: null,
    shownInsightIds: [],
    startDay: new Date().toISOString().slice(0, 10),
  };
}

export function currentItemId(
  session: TestSession,
  bank: ItemBank,
  model: ModelVersion,
): ItemId | null {
  if (session.completed || session.answered.length >= 10) return null;
  const rng = createRng(session.seed + session.answered.length);
  return new FixedSelector().next(session, bank, model, rng);
}

export function answerCurrent(
  session: TestSession,
  bank: ItemBank,
  model: ModelVersion,
  value: ResponseValue,
  rtMs: number,
): TestSession {
  const itemId = currentItemId(session, bank, model);
  if (!itemId) return session;

  const answered: AnsweredItem = {
    itemId,
    value,
    rtMs,
    order: session.answered.length,
  };
  return {
    ...session,
    answered: [...session.answered, answered],
    usedItemIds: [...session.usedItemIds, itemId],
    completed: false,
    scored: null,
    sessionCode: null,
    storageSaved: false,
    storageError: null,
  };
}

/** One-step back: drop later answers; FixedSelector recomputes from seed. */
export function backOne(session: TestSession): TestSession {
  if (session.answered.length === 0) return session;
  const answered = session.answered.slice(0, -1);
  return {
    ...session,
    answered,
    usedItemIds: answered.map((a) => a.itemId),
    completed: false,
    scored: null,
    sessionCode: null,
    storageSaved: false,
    storageError: null,
  };
}

export function finishIfComplete(
  session: TestSession,
  bank: ItemBank,
  model: ModelVersion,
): TestSession {
  if (session.answered.length < 10) return session;
  const scored = scoreSession(bank, model, session.answered);
  return {
    ...session,
    completed: true,
    scored,
  };
}
