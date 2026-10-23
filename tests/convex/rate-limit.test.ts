import { afterEach, describe, expect, it, vi } from "vitest";
import { consume, purgeExpired } from "../../convex/rateLimit";
import { handlerOf, mutationFixture } from "./mutation-fixture";
const consumeQuota = handlerOf(consume);
const purgeQuotas = handlerOf(purgeExpired);

describe("shared Convex quotas", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });
  it("enforces quotas across callers, restores expired quotas, and purges old identifiers", async () => {
    vi.stubEnv("CONVEX_SERVER_KEY", "test-key");
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-23T12:00:00Z"));
    const fixture = mutationFixture();
    const ctx = fixture.ctx as unknown as Parameters<typeof consumeQuota>[0];
    const args = {
      serverKey: "test-key",
      bucket: "a".repeat(32),
      route: "delete" as const,
      shared: true,
    };
    for (let i = 0; i < 8; i++) expect(await consumeQuota(ctx, args)).toBe(true);
    expect(await consumeQuota(ctx, args)).toBe(false);
    expect(fixture.rows("rateLimits")).toHaveLength(1);
    await expect(consumeQuota(ctx, { ...args, serverKey: "wrong" })).rejects.toThrow(
      "unauthorized",
    );
    await expect(
      consumeQuota(ctx, { ...args, bucket: "raw-ip-address" }),
    ).rejects.toThrow("invalid_bucket");
    vi.advanceTimersByTime(60_001);
    expect(await consumeQuota(ctx, args)).toBe(true);
    vi.advanceTimersByTime(60_001);
    expect(await purgeQuotas(ctx, {})).toBe(1);
    expect(fixture.rows("rateLimits")).toHaveLength(0);
  });
});
