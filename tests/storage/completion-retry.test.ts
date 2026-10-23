import { describe, expect, it, vi } from "vitest";
import { loadItemBank, loadModelVersion } from "@/engine/load-content";
import { scoreSession } from "@/engine/score";
import { MemoryAdapter } from "@/storage/memory";
import { ConvexAdapter } from "@/storage/convex-adapter";
import { completionSessionCode } from "@/storage/session-code";
import { completionPayloadSchema } from "@/storage/request-schema";
import type { CompletionPayload } from "@/storage/types";

const bank = loadItemBank();
const model = loadModelVersion();
const responses = model.fixedFormOrder.map((itemId, order) => ({
  itemId,
  order,
  value: 3 as const,
  rtMs: 2000,
}));
const scored = scoreSession(bank, model, responses);
const payload: CompletionPayload = {
  completionId: "3422c07c-21ee-4b07-8d58-3ef867c21234",
  modelVersionId: model.id,
  responses,
  clientScores: scored.traits.map(({ traitId, theta, slider }) => ({
    traitId,
    theta,
    slider,
  })),
  flags: scored.flags,
  shownInsightIds: [],
  deviceClass: "desktop",
  startDay: "2026-10-23",
  locale: "en",
  retakeLater: false,
  consentStore: true,
  ageConfirmed: true,
};

describe("completion retries", () => {
  it("accepts the real completion payload and rejects non-numeric scores", () => {
    expect(completionPayloadSchema.safeParse(payload).success).toBe(true);
    const bad = {
      ...payload,
      clientScores: payload.clientScores.map((s) => ({ ...s, slider: "bad" })),
    };
    expect(completionPayloadSchema.safeParse(bad).success).toBe(false);
  });

  it("recovers the same code across processes without keeping plaintext codes", async () => {
    const code = await completionSessionCode(payload.completionId);
    expect(await completionSessionCode(payload.completionId)).toBe(code);
    expect(await completionSessionCode(crypto.randomUUID())).not.toBe(code);
    expect(code).toMatch(/^[A-HJ-NP-Z2-9]{16}$/);
  });

  it("deduplicates concurrent retries and skips already validated scoring", async () => {
    const score = vi.fn(() => scored);
    const adapter = new MemoryAdapter(score);
    const results = await Promise.all(
      Array.from({ length: 8 }, () => adapter.saveCompletion(payload, scored)),
    );
    expect(new Set(results.map((r) => r.sessionCode)).size).toBe(1);
    expect(adapter.getAll()).toHaveLength(1);
    expect(score).not.toHaveBeenCalled();
    await expect(
      adapter.saveCompletion({ ...payload, startDay: "2026-10-22" }, scored),
    ).rejects.toThrow("completion_conflict");
    expect(adapter.getAll()).toHaveLength(1);
    expect(await adapter.deleteByCode(results[0]!.sessionCode)).toMatchObject({
      deleted: true,
      sessionsRemoved: 1,
    });
  });

  it("passes a trusted score to Convex without running the engine again", async () => {
    const score = vi.fn(() => scored);
    const mutation = vi
      .fn<(name: string, args: Record<string, unknown>) => Promise<unknown>>()
      .mockResolvedValue({ sessionCode: "ABCDEFGH23" });
    const adapter = new ConvexAdapter({ mutation }, "test-server-key", score);
    await adapter.saveCompletion(payload, scored);
    expect(score).not.toHaveBeenCalled();
    expect(mutation.mock.calls[0]?.[1]).toMatchObject({
      payload: { flags: scored.flags },
    });
  });
});
