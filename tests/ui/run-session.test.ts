import { describe, expect, it } from "vitest";
import {
  loadItemBank,
  loadItemTextEn,
  loadModelVersion,
} from "@/engine/load-content";
import {
  answerCurrent,
  backOne,
  createSession,
  currentItemId,
  finishIfComplete,
} from "@/session/run-session";

describe("run-session", () => {
  const bank = loadItemBank();
  const model = loadModelVersion();
  const textEn = loadItemTextEn();

  it("serves exactly 10 items then completes with scores", () => {
    let session = createSession(42);
    const seen: string[] = [];

    for (let i = 0; i < 10; i++) {
      const id = currentItemId(session, bank, model);
      expect(id).not.toBeNull();
      expect(textEn[id!]).toBeTruthy();
      seen.push(id!);
      session = answerCurrent(session, bank, model, (3 + (i % 3)) as 1 | 2 | 3 | 4 | 5, 1500 + i);
    }

    expect(new Set(seen).size).toBe(10);
    expect(currentItemId(session, bank, model)).toBeNull();

    const finished = finishIfComplete(session, bank, model);
    expect(finished.completed).toBe(true);
    expect(finished.scored?.traits).toHaveLength(5);
  });

  it("back drops the last answer and recomputes the next item", () => {
    let session = createSession(7);
    const first = currentItemId(session, bank, model)!;
    session = answerCurrent(session, bank, model, 4, 2000);
    const second = currentItemId(session, bank, model)!;
    expect(second).not.toBe(first);

    session = answerCurrent(session, bank, model, 2, 2000);
    session = backOne(session);
    expect(session.answered).toHaveLength(1);
    expect(currentItemId(session, bank, model)).toBe(second);

    session = backOne(session);
    expect(session.answered).toHaveLength(0);
    expect(currentItemId(session, bank, model)).toBe(first);
  });
});
