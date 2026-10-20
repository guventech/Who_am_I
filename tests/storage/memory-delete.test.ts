import { describe, expect, it } from "vitest";
import {
  loadItemBank,
  loadModelVersion,
} from "@/engine/load-content";
import { scoreSession } from "@/engine/score";
import { MemoryAdapter } from "@/storage/memory";
import { hashSessionCode } from "@/storage/session-code";
import type { CompletionPayload } from "@/storage/types";

describe("MemoryAdapter delete", () => {
  const bank = loadItemBank();
  const model = loadModelVersion();

  function makePayload(): CompletionPayload {
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
      deviceClass: "desktop",
      startDay: "2026-10-20",
      locale: "en",
      retakeLater: true,
    };
  }

  it("removes the session and linked retakes", async () => {
    const adapter = new MemoryAdapter((p) =>
      scoreSession(bank, model, p.responses),
    );
    const first = await adapter.saveCompletion(makePayload());
    await adapter.saveCompletion({
      ...makePayload(),
      previousSessionCode: first.sessionCode,
    });
    expect(adapter.getAll()).toHaveLength(2);

    const deleted = await adapter.deleteByCode(first.sessionCode);
    expect(deleted.deleted).toBe(true);
    expect(deleted.sessionsRemoved).toBe(2);

    const again = await adapter.deleteByCode(first.sessionCode);
    expect(again.deleted).toBe(false);
    expect(adapter.getAll()).toHaveLength(0);

    const firstHash = await hashSessionCode(first.sessionCode);
    expect(adapter.getAll().some((r) => r.codeHash === firstHash)).toBe(false);
  });
});
