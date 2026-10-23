import { afterEach, describe, expect, it, vi } from "vitest";
import { HttpStorageAdapter } from "@/storage/http-client";

describe("storage request deadlines", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("aborts a stalled request and releases its timeout", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal!.addEventListener("abort", () =>
              reject(new DOMException("Aborted", "AbortError")),
            );
          }),
      ),
    );
    const pending = new HttpStorageAdapter("/api/storage", 100).deleteByCode(
      "ABCDEFGH23",
    );
    const rejected = expect(pending).rejects.toThrow("request_timeout");
    await vi.advanceTimersByTimeAsync(100);
    await rejected;
    expect(vi.getTimerCount()).toBe(0);
  });
});
