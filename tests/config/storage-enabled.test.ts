import { afterEach, describe, expect, it, vi } from "vitest";

describe("isStorageEnabled", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("is true outside production (memory path)", async () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("CONVEX_URL", "");
    vi.stubEnv("CONVEX_SERVER_KEY", "");
    vi.stubEnv("SESSION_CODE_PEPPER", "");
    const { isStorageEnabled } = await import("@/config/storage-enabled");
    expect(isStorageEnabled()).toBe(true);
  });

  it("is false in production when any of the three env vars is missing", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("CONVEX_URL", "https://example.convex.cloud");
    vi.stubEnv("CONVEX_SERVER_KEY", "secret");
    vi.stubEnv("SESSION_CODE_PEPPER", "");
    const { isStorageEnabled } = await import("@/config/storage-enabled");
    expect(isStorageEnabled()).toBe(false);
  });

  it("is true in production when CONVEX_URL, CONVEX_SERVER_KEY and SESSION_CODE_PEPPER are set", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("CONVEX_URL", "https://example.convex.cloud");
    vi.stubEnv("CONVEX_SERVER_KEY", "secret");
    vi.stubEnv("SESSION_CODE_PEPPER", "pepper");
    const { isStorageEnabled } = await import("@/config/storage-enabled");
    expect(isStorageEnabled()).toBe(true);
  });
});
