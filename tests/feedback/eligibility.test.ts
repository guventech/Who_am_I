import { describe, expect, it } from "vitest";
import { canGiveFeedback } from "@/feedback/eligibility";
import { createSession } from "@/session/run-session";
import { answerCurrent, finishIfComplete } from "@/session/run-session";
import { beginDeeperSession } from "@/session/run-deeper";
import {
  loadItemBank,
  loadModelVersion,
  loadDeeperModelVersion,
} from "@/engine/load-content";

describe("feedback completion eligibility", () => {
  it("unlocks only after finishing the core test and remains unlocked during Go deeper", () => {
    const bank = loadItemBank();
    const model = loadModelVersion();
    let session = createSession(42);
    expect(canGiveFeedback(null)).toBe(false);
    expect(canGiveFeedback(session)).toBe(false);
    for (let i = 0; i < 10; i++) {
      session = answerCurrent(session, bank, model, 3, 2000);
      expect(canGiveFeedback(session)).toBe(false);
    }
    session = finishIfComplete(session, bank, model);
    expect(canGiveFeedback(session)).toBe(true);
    const deeper = beginDeeperSession(session, bank, loadDeeperModelVersion());
    expect(deeper.completed).toBe(false);
    expect(canGiveFeedback(deeper)).toBe(true);
    const legacyDeeper = { ...deeper, coreScored: undefined };
    expect(canGiveFeedback(legacyDeeper)).toBe(true);
  });
});
