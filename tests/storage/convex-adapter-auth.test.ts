import { afterEach, describe, expect, it, vi } from "vitest";
import { ConvexAdapter } from "@/storage/convex-adapter";
import type { CompletionPayload } from "@/storage/types";

const basePayload: CompletionPayload = {
  modelVersionId: "model-v0-dev",
  responses: [
    { itemId: "X01", value: 3, rtMs: 1200, order: 0 },
  ],
  clientScores: [],
  flags: { fast: false, straightline: false, any: false },
  shownInsightIds: [],
  deviceClass: "desktop",
  startDay: "2026-01-01",
  locale: "en",
  retakeLater: false,
  consentStore: true,
  ageConfirmed: true,
};

describe("ConvexAdapter passes serverKey", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("includes serverKey on every mutation and does not call without it", async () => {
    vi.stubEnv("SESSION_CODE_PEPPER", "test-pepper");
    vi.stubEnv("NODE_ENV", "test");

    const calls: { name: string; args: Record<string, unknown> }[] = [];
    const adapter = new ConvexAdapter(
      {
        mutation: async (name, args) => {
          calls.push({ name, args });
          if (name === "sessions:saveCompletion") {
            return { sessionCode: "TESTCODE01" };
          }
          if (name === "sessions:deleteByCode") {
            return { deleted: true, sessionsRemoved: 1 };
          }
          return undefined;
        },
      },
      "server-secret",
      () => ({
        traits: [
          {
            traitId: "E",
            theta: 0,
            sd: 1,
            slider: 50,
            credibleLow: 0,
            credibleHigh: 1,
            retakeLow: 0,
            retakeHigh: 1,
            pLow: 0.3,
            pMid: 0.4,
            pHigh: 0.3,
            level: "mid",
            confidence: "soft",
          },
        ],
        flags: { fast: false, straightline: false, any: false },
      }),
    );

    await adapter.saveCompletion(basePayload);
    await adapter.deleteByCode("ABCDEFGH12");
    await adapter.saveFeedback("ABCDEFGH12", {
      overallFit: 3,
      traits: [],
      insightThumbs: [],
    });

    expect(calls).toHaveLength(3);
    for (const call of calls) {
      expect(call.args.serverKey).toBe("server-secret");
    }
    expect(calls[0]!.name).toBe("sessions:saveCompletion");
    expect(calls[1]!.name).toBe("sessions:deleteByCode");
    expect(calls[1]!.args).toHaveProperty("codeHash");
    expect(calls[2]!.name).toBe("sessions:saveFeedback");
  });
});
