import { describe, expect, it, vi } from "vitest";
import { NoopAdapter } from "@/storage/noop";

describe("NoopAdapter", () => {
  it("never performs network I/O", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const adapter = new NoopAdapter();
    await adapter.saveCompletion({
      modelVersionId: "model-v0-dev",
      responses: [],
      clientScores: [],
      flags: { fast: false, straightline: false, any: false },
      shownInsightIds: [],
      deviceClass: "desktop",
      startDay: "2026-10-20",
      locale: "en",
      retakeLater: false,
    });
    await adapter.deleteByCode("ABCDEFGH");
    await adapter.saveFeedback("ABCDEFGH", {
      overallFit: 3,
      traits: [],
      insightThumbs: [],
    });
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
