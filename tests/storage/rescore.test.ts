import { describe, expect, it } from "vitest";
import {
  loadItemBank,
  loadModelVersion,
} from "@/engine/load-content";
import { scoreSession } from "@/engine/score";
import { validateAndRescore } from "@/storage/rescore";
import type { CompletionPayload } from "@/storage/types";

describe("validateAndRescore", () => {
  const bank = loadItemBank();
  const model = loadModelVersion();

  function payload(
    overrides: Partial<CompletionPayload> = {},
  ): CompletionPayload {
    const answered = model.fixedFormOrder.slice(0, 10).map((itemId, order) => ({
      itemId,
      value: 3 as const,
      rtMs: 2000,
      order,
    }));
    const scored = scoreSession(bank, model, answered);
    return {
      modelVersionId: model.id,
      responses: answered,
      clientScores: scored.traits.map((t) => ({
        traitId: t.traitId,
        slider: t.slider,
        theta: t.theta,
      })),
      flags: scored.flags,
      shownInsightIds: [],
      deviceClass: "mobile",
      startDay: "2026-10-20",
      locale: "en",
      retakeLater: false,
      consentStore: true,
      ageConfirmed: true,
      ...overrides,
    };
  }

  it("accepts matching client scores", () => {
    const result = validateAndRescore(payload(), bank, model);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.scored.traits).toHaveLength(5);
  });

  it("rejects out-of-range responses", () => {
    const bad = payload({
      responses: [
        {
          itemId: model.fixedFormOrder[0]!,
          value: 9 as unknown as 1,
          rtMs: 1000,
          order: 0,
        },
      ],
    });
    const result = validateAndRescore(bad, bank, model);
    expect(result.ok).toBe(false);
  });

  it("rejects score mismatches", () => {
    const p = payload();
    p.clientScores[0] = { ...p.clientScores[0]!, slider: 0.99 };
    const result = validateAndRescore(p, bank, model);
    expect(result.ok).toBe(false);
  });
});
