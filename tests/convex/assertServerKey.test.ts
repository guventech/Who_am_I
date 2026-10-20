import { afterEach, describe, expect, it, vi } from "vitest";

describe("assertServerKey", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("throws unauthorized when env key is missing", async () => {
    vi.stubEnv("CONVEX_SERVER_KEY", "");
    const { assertServerKey } = await import(
      "../../convex/lib/assertServerKey"
    );
    expect(() => assertServerKey("anything")).toThrow("unauthorized");
  });

  it("throws unauthorized for wrong or empty key and accepts the match", async () => {
    vi.stubEnv("CONVEX_SERVER_KEY", "correct-key-value");
    const { assertServerKey } = await import(
      "../../convex/lib/assertServerKey"
    );
    expect(() => assertServerKey("")).toThrow("unauthorized");
    expect(() => assertServerKey("wrong")).toThrow("unauthorized");
    expect(() => assertServerKey("correct-key-value")).not.toThrow();
  });
});
