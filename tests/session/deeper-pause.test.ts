import { beforeAll, describe, expect, it } from "vitest";
import {
  loadItemBank,
  loadModelVersion,
  loadDeeperModelVersion,
} from "@/engine/load-content";
import {
  createSession,
  answerCurrent,
  finishIfComplete,
  type TestSession,
} from "@/session/run-session";
import { beginDeeperSession, answerDeeper, backDeeperOne } from "@/session/run-deeper";
import { resultView } from "@/session/result-view";
import { sessionSchema } from "@/session/session-schema";

const bank = loadItemBank();
const model = loadModelVersion();
const deeperModel = loadDeeperModelVersion();
let core: TestSession;

beforeAll(() => {
  core = createSession(42);
  for (let i = 0; i < 10; i++) core = answerCurrent(core, bank, model, 3, 2000);
  core = finishIfComplete(core, bank, model);
});

describe("Go deeper preserves the original result", () => {
  it("keeps an independent snapshot through answers, back, refresh and completion", () => {
    let deeper = beginDeeperSession(core, bank, deeperModel);
    expect(deeper.coreScored).toEqual(core.scored);
    expect(deeper.coreScored).not.toBe(core.scored);
    deeper = answerDeeper(deeper, bank, deeperModel, 4, 2000);
    expect(resultView(deeper, bank, model)).toMatchObject({
      paused: true,
      scored: core.scored,
    });
    const restored = JSON.parse(JSON.stringify(deeper));
    expect(sessionSchema.safeParse(restored).success).toBe(true);
    expect(resultView(restored, bank, model).scored).toEqual(core.scored);
    deeper = backDeeperOne(deeper);
    expect(deeper.coreScored).toEqual(core.scored);
    for (let i = 0; i < 10 && !deeper.completed; i++)
      deeper = answerDeeper(deeper, bank, deeperModel, 3, 2000);
    expect(deeper.completed).toBe(true);
    expect(deeper.scored?.traits.some((t) => t.traitId === "H")).toBe(true);
    const view = resultView(deeper, bank, model);
    expect(view.paused).toBe(false);
    expect(view.original).toEqual(core.scored);
    expect(view.scored).toBe(deeper.scored);
    expect(core.scored?.traits).toHaveLength(5);
  }, 15_000);

  it("recovers the original from retained answers in older deeper sessions", () => {
    const legacy = beginDeeperSession(core, bank, deeperModel);
    delete legacy.coreScored;
    const view = resultView(legacy, bank, model);
    expect(view.scored).toEqual(core.scored);
    expect(view.paused).toBe(true);
  });
});
