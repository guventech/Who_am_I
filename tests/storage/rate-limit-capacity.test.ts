import { describe, expect, it, vi } from "vitest";

describe("bounded rate-limit memory", () => {
  it("refuses new buckets at capacity and reclaims expired buckets", async () => {
    vi.resetModules();
    const { allowRequest, MAX_RATE_BUCKETS } = await import("@/storage/rate-limit");
    for (let i = 0; i < MAX_RATE_BUCKETS; i++) {
      expect(allowRequest(`client-${i}`, 2, 60_000, 0)).toBe(true);
    }
    expect(allowRequest("overflow", 2, 60_000, 0)).toBe(false);
    expect(allowRequest("client-0", 2, 60_000, 0)).toBe(true);
    expect(allowRequest("client-0", 2, 60_000, 0)).toBe(false);
    expect(allowRequest("new-window", 2, 60_000, 60_000)).toBe(true);
  });
});
