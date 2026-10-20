import { describe, expect, it } from "vitest";
import {
  createRunningPosterior,
  scoreResponses,
  updateRunningPosterior,
} from "../../src/engine/grid";
import { loadItemBank, loadModelVersion } from "../../src/engine/load-content";
import { createRng } from "../../src/engine/math";
import { sampleResponse } from "../../src/engine/grm";
import type { AnsweredItem } from "../../src/engine/types";

describe("posterior EAP", () => {
  it("SD decreases as informative items are added", () => {
    const bank = loadItemBank();
    const model = loadModelVersion();
    const running = createRunningPosterior(model);
    const previousTrace = running.summary.cov
      .filter((_, i) => i % 6 === 0)
      .reduce((a, b) => a + b, 0);

    const core = bank.items.filter((i) => i.status === "active" && i.pool === "core");
    let lastTrace = previousTrace;
    for (let i = 0; i < 5; i++) {
      const item = core[i]!;
      updateRunningPosterior(running, item, 5);
      const trace = running.summary.sd.reduce((a, s) => a + s * s, 0);
      expect(trace).toBeLessThanOrEqual(lastTrace + 1e-9);
      lastTrace = trace;
    }
  });

  it("order of responses does not change the posterior", () => {
    const bank = loadItemBank();
    const model = loadModelVersion();
    const ids = model.fixedFormOrder.length
      ? model.fixedFormOrder
      : bank.items
          .filter((i) => i.status === "active" && i.pool === "core")
          .slice(0, 5)
          .map((i) => i.id);

    const answers: AnsweredItem[] = ids.map((itemId, order) => ({
      itemId,
      value: ((order % 5) + 1) as 1 | 2 | 3 | 4 | 5,
      rtMs: 2000,
      order,
    }));
    const reversed = [...answers].reverse().map((a, order) => ({ ...a, order }));

    const a = scoreResponses(bank, model, answers);
    const b = scoreResponses(bank, model, reversed);
    for (let i = 0; i < 5; i++) {
      expect(a.mean[i]!).toBeCloseTo(b.mean[i]!, 5);
      expect(a.sd[i]!).toBeCloseTo(b.sd[i]!, 5);
    }
  });

  it(
    "parameter recovery correlates with true theta (SYNTHETIC)",
    () => {
    const bank = loadItemBank();
    const model = loadModelVersion();
    const rng = createRng(7);
    const items = bank.items
      .filter((i) => i.status === "active" && i.pool === "core" && i.primaryTrait === "E")
      .slice(0, 8);

    const trueE: number[] = [];
    const estE: number[] = [];
    for (let n = 0; n < 24; n++) {
      const theta = [rng.next() * 2 - 1, 0, 0, 0, 0];
      trueE.push(theta[0]!);
      const answered: AnsweredItem[] = items.map((item, order) => ({
        itemId: item.id,
        value: sampleResponse(item, theta, rng.next()),
        rtMs: 2000,
        order,
      }));
      const post = scoreResponses(bank, model, answered);
      estE.push(post.mean[0]!);
    }

    // crude correlation
    const meanT = trueE.reduce((a, b) => a + b, 0) / trueE.length;
    const meanE = estE.reduce((a, b) => a + b, 0) / estE.length;
    let num = 0;
    let dt = 0;
    let de = 0;
    for (let i = 0; i < trueE.length; i++) {
      const a = trueE[i]! - meanT;
      const b = estE[i]! - meanE;
      num += a * b;
      dt += a * a;
      de += b * b;
    }
    const r = num / Math.sqrt(dt * de);
    expect(r).toBeGreaterThan(0.4);
  },
    60_000,
  );
});
