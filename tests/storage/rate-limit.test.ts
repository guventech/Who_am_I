import { describe, expect, it } from "vitest";
import {
  allowRequest,
  allowRoutedRequest,
  hmacBucketFromRequest,
  rateLimitKeyFromRequest,
} from "@/storage/rate-limit";

describe("rate limit", () => {
  it("allows up to the limit then blocks", () => {
    const key = `test-${Math.random()}`;
    expect(allowRequest(key, 2, 60_000)).toBe(true);
    expect(allowRequest(key, 2, 60_000)).toBe(true);
    expect(allowRequest(key, 2, 60_000)).toBe(false);
  });

  it("keys by HMAC of IP, ignoring client x-rate-bucket", () => {
    const req = new Request("http://localhost/api/storage/complete", {
      headers: {
        "x-rate-bucket": "abc12345xyz",
        "x-forwarded-for": "203.0.113.10",
      },
    });
    const { key, shared } = rateLimitKeyFromRequest(req, "complete");
    expect(shared).toBe(false);
    expect(key).not.toContain("abc12345xyz");
    expect(key).toContain(hmacBucketFromRequest(req));
  });

  it("same IP shares a bucket across rotating headers", () => {
    const route = `iso-${Math.random().toString(36).slice(2)}`;
    for (let i = 0; i < 5; i++) {
      const req = new Request("http://localhost/x", {
        headers: {
          "x-rate-bucket": `rotate-${i}-${Math.random().toString(36).slice(2)}`,
          "x-forwarded-for": "198.51.100.7",
        },
      });
      expect(allowRoutedRequest(req, route, 5, 2)).toBe(true);
    }
    const blocked = new Request("http://localhost/x", {
      headers: {
        "x-rate-bucket": "another-rotating-header-xx",
        "x-forwarded-for": "198.51.100.7",
      },
    });
    expect(allowRoutedRequest(blocked, route, 5, 2)).toBe(false);
  });

  it("different IPs do not share quota", () => {
    const route = `iso-${Math.random().toString(36).slice(2)}`;
    const a = new Request("http://localhost/x", {
      headers: { "x-forwarded-for": "198.51.100.1" },
    });
    const b = new Request("http://localhost/x", {
      headers: { "x-forwarded-for": "198.51.100.2" },
    });
    for (let i = 0; i < 5; i++) {
      expect(allowRoutedRequest(a, route, 5, 2)).toBe(true);
    }
    expect(allowRoutedRequest(a, route, 5, 2)).toBe(false);
    expect(allowRoutedRequest(b, route, 5, 2)).toBe(true);
  });
});
