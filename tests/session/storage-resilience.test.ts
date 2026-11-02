// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
  sessionStorage.clear();
});

describe("browser session resilience", () => {
  it("continues in memory when access to sessionStorage throws", async () => {
    vi.spyOn(window, "sessionStorage", "get").mockImplementation(() => {
      throw new DOMException("Storage blocked", "SecurityError");
    });
    const store = await import("@/session/session-store");
    expect(store.getSessionSnapshot()).toBeNull();
    expect(store.getSessionStorageStatus()).toBe("unavailable");
    const session = store.beginFreshSession(42);
    store.saveSession({ ...session, usedItemIds: ["X01"] });
    expect(store.getSessionSnapshot()?.usedItemIds).toEqual(["X01"]);
    expect(() => store.clearSession()).not.toThrow();
    expect(store.getSessionSnapshot()).toBeNull();
  });

  it("notifies subscribers and retains answers when a write fails", async () => {
    const store = await import("@/session/session-store");
    const callback = vi.fn();
    store.subscribeSession(callback);
    const write = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Storage full", "QuotaExceededError");
    });
    const session = store.beginFreshSession(42);
    expect(store.getSessionSnapshot()).toBe(session);
    expect(store.getSessionStorageStatus()).toBe("unavailable");
    expect(callback).toHaveBeenCalledOnce();
    write.mockRestore();
    store.saveSession(session);
    expect(store.getSessionStorageStatus()).toBe("available");
    expect(JSON.parse(sessionStorage.getItem("whoami-session-v1")!).seed).toBe(42);
  });

  it.each(["{broken", "null", JSON.stringify({ seed: 1, answered: "bad" })])(
    "rejects corrupted stored progress without crashing: %s",
    async (raw) => {
      sessionStorage.setItem("whoami-session-v1", raw);
      const store = await import("@/session/session-store");
      expect(store.getSessionSnapshot()).toBeNull();
      expect(store.getSessionStorageStatus()).toBe("invalid");
      const fresh = store.beginFreshSession(9);
      expect(fresh.answered).toEqual([]);
      expect(store.getSessionStorageStatus()).toBe("available");
    },
  );

  it("restores legacy core sessions with normalised defaults", async () => {
    sessionStorage.setItem(
      "whoami-session-v1",
      JSON.stringify({
        seed: 42,
        answered: [],
        usedItemIds: [],
        completed: false,
        scored: null,
      }),
    );
    const store = await import("@/session/session-store");
    expect(store.getSessionSnapshot()).toMatchObject({
      seed: 42,
      round: "core",
      answered: [],
    });
    expect(store.getSessionSnapshot()?.completionId).toBeTruthy();
    expect(store.getSessionStorageStatus()).toBe("available");
  });
});
