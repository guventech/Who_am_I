import type { TestSession } from "@/session/run-session";
import { isDeeperSession } from "@/session/run-deeper";
import { scoreSession } from "@/engine/score";
import type { ItemBank, ModelVersion } from "@/engine/types";

/** New sessions retain the exact result. Older deeper sessions retain the answers. */
export function resultView(
  session: TestSession | null,
  bank: ItemBank,
  coreModel: ModelVersion,
) {
  const deeper = session && isDeeperSession(session) ? session : null;
  const original = deeper
    ? (deeper.coreScored ??
      (deeper.coreAnswered?.length >= 10
        ? scoreSession(bank, coreModel, deeper.coreAnswered)
        : null))
    : null;
  return {
    scored: session?.completed ? session.scored : original,
    original,
    paused: Boolean(deeper && !deeper.completed),
  };
}
