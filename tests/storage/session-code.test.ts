import { describe, expect, it } from "vitest";
import {
  generateSessionCode,
  hashSessionCode,
  verifySessionCode,
} from "@/storage/session-code";

describe("session code", () => {
  it("generates opaque codes and only stores hashes", async () => {
    const code = generateSessionCode(() => 0.42);
    expect(code.length).toBeGreaterThanOrEqual(8);
    expect(code).not.toMatch(/[^A-Z2-9]/);
    const hash = await hashSessionCode(code);
    expect(hash).toHaveLength(64);
    expect(hash).not.toContain(code);
    expect(await verifySessionCode(code, hash)).toBe(true);
    expect(await verifySessionCode("WRONGCODE", hash)).toBe(false);
  });
});
