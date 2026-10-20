import { afterEach, describe, expect, it, vi } from "vitest";
import { assertServerKey } from "../../convex/lib/assertServerKey";

/**
 * Simulates the Convex mutation entrypoints: auth first, then db work.
 * Wrong or missing keys must throw before any write.
 */
function gatedHandler(
  serverKey: string,
  write: () => void,
): void {
  assertServerKey(serverKey);
  write();
}

describe("Convex session handlers auth gate", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("wrong or missing key throws and writes nothing", () => {
    vi.stubEnv("CONVEX_SERVER_KEY", "real-secret");
    let writes = 0;
    const write = () => {
      writes += 1;
    };

    expect(() => gatedHandler("", write)).toThrow("unauthorized");
    expect(() => gatedHandler("wrong", write)).toThrow("unauthorized");
    expect(writes).toBe(0);

    gatedHandler("real-secret", write);
    expect(writes).toBe(1);
  });
});
