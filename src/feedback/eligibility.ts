import type { TestSession } from "@/session/run-session";
import type { DeeperSession } from "@/session/run-deeper";

/** A completed core test remains eligible while the optional round is paused. */
export function canGiveFeedback(session: TestSession | null): boolean {
  return (
    !!session &&
    ((session.completed && !!session.scored) ||
      (session.round === "deeper" &&
        (!!(session as DeeperSession).coreScored ||
          ((session as DeeperSession).coreAnswered?.length ?? 0) >= 10)))
  );
}

export function feedbackDay(): string {
  return new Date().toISOString().slice(0, 10);
}
