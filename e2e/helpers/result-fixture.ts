import type { Page } from "@playwright/test";
import type { TraitScore } from "../../src/engine/types";
import { createSession } from "../../src/session/run-session";

/** Legacy saved shape, with no new colour or export fields. */
export function exampleResult() {
  const traits = (
    [
      ["E", 0.25],
      ["A", 0.7],
      ["C", 0.3],
      ["ES", 0.1],
      ["O", 0.2],
    ] as const
  ).map(([traitId, slider]): TraitScore => ({
    traitId,
    slider,
    theta: slider,
    sd: 0.5,
    level: "mid",
    confidence: "soft",
    retakeLow: -0.7,
    retakeHigh: 0.9,
    credibleLow: -0.7,
    credibleHigh: 0.9,
    pLow: 0.2,
    pMid: 0.6,
    pHigh: 0.2,
  }));
  return {
    ...createSession(42),
    completed: true,
    scored: { traits, flags: { fast: false, straightline: false, any: false } },
  };
}

export async function loadExampleResult(page: Page) {
  await page.goto("/");
  await page.evaluate((session) => {
    sessionStorage.setItem("whoami-session-v1", JSON.stringify(session));
  }, exampleResult());
  await page.goto("/result");
}
