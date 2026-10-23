import { afterEach, describe, expect, it, vi } from "vitest";
import { isStorageEnabled, isLegacyDeletionEnabled } from "@/config/storage-enabled";
describe("server saving is retired", () => {
  afterEach(() => vi.unstubAllEnvs());
  it.each(["development", "test", "production"])(
    "never enables saving in %s, even with old credentials",
    (mode) => {
      vi.stubEnv("NODE_ENV", mode);
      vi.stubEnv("CONVEX_URL", "https://example.convex.cloud");
      vi.stubEnv("CONVEX_SERVER_KEY", "test-key");
      vi.stubEnv("SESSION_CODE_PEPPER", "test-pepper");
      expect(isStorageEnabled()).toBe(false);
      expect(isLegacyDeletionEnabled()).toBe(true);
    },
  );
});
