import { describe, expect, it } from "vitest";
import {
  allowRequest,
  allowRoutedRequest,
  rateLimitKeyFromRequest,
} from "@/storage/rate-limit";

describe("rate limit", () => {
  it("allows up to the limit then blocks", () => {
    const key = `test-${Math.random()}`;
    expect(allowRequest(key, 2, 60_000)).toBe(true);
    expect(allowRequest(key, 2, 60_000)).toBe(true);
    expect(allowRequest(key, 2, 60_000)).toBe(false);
  });

  it("uses per-client bucket when x-rate-bucket is present", () => {
    const req = new Request("http://localhost/api/storage/complete", {
      headers: { "x-rate-bucket": "abc12345xyz" },
    });
    const { key, shared } = rateLimitKeyFromRequest(req, "complete");
    expect(shared).toBe(false);
    expect(key).toContain("abc12345xyz");
  });

  it("falls back to shared bucket without header", () => {
    const req = new Request("http://localhost/api/storage/complete");
    const { key, shared } = rateLimitKeyFromRequest(req, "complete");
    expect(shared).toBe(true);
    expect(key.endsWith(":shared")).toBe(true);
  });

  it("does not let one client exhaust another client's quota", () => {
    const a = new Request("http://localhost/x", {
      headers: { "x-rate-bucket": "clientAAAAAA" },
    });
    const b = new Request("http://localhost/x", {
      headers: { "x-rate-bucket": "clientBBBBBB" },
    });
    const route = `iso-${Math.random().toString(36).slice(2)}`;
    for (let i = 0; i < 5; i++) {
      expect(allowRoutedRequest(a, route, 5, 2)).toBe(true);
    }
    expect(allowRoutedRequest(a, route, 5, 2)).toBe(false);
    expect(allowRoutedRequest(b, route, 5, 2)).toBe(true);
  });
});
