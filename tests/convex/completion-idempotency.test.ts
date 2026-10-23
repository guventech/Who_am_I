import { afterEach, describe, expect, it, vi } from "vitest";
import { saveCompletion } from "../../convex/sessions";
import { handlerOf, mutationFixture } from "./mutation-fixture";
const save = handlerOf(saveCompletion);

describe("Convex completion handler", () => {
  afterEach(() => vi.unstubAllEnvs());
  it("returns the existing code on replay and rejects reuse for different answers", async () => {
    vi.stubEnv("CONVEX_SERVER_KEY", "test-key");
    const fixture = mutationFixture();
    const ctx = fixture.ctx as unknown as Parameters<typeof save>[0];
    const payload = {
      modelVersionId: "test-model",
      responses: [],
      clientScores: [],
      flags: { fast: false, straightline: false, any: false },
      shownInsightIds: [],
      deviceClass: "desktop",
      startDay: "2026-10-23",
      locale: "en" as const,
      retakeLater: false,
      codeHash: "opaque-code-hash",
      completionFingerprint: "answer-fingerprint",
      sessionCodePlaintextForClient: "ABCDEFGH23456789",
      scoredTraits: [],
    };
    const first = await save(ctx, { serverKey: "test-key", payload });
    expect(await save(ctx, { serverKey: "test-key", payload })).toEqual(first);
    expect(fixture.rows("sessions")).toHaveLength(1);
    expect(fixture.rows("sessions")[0]).not.toHaveProperty(
      "sessionCodePlaintextForClient",
    );
    await expect(
      save(ctx, {
        serverKey: "test-key",
        payload: { ...payload, completionFingerprint: "different" },
      }),
    ).rejects.toThrow("completion_conflict");
    await expect(save(ctx, { serverKey: "wrong-key", payload })).rejects.toThrow(
      "unauthorized",
    );
    expect(fixture.rows("sessions")).toHaveLength(1);
  });
});
