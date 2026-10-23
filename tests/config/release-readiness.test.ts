import { describe, expect, it } from "vitest";
import { parseEnv } from "@/config/env";
import { assertReleaseReady } from "@/config/release-readiness";
import { loadModelVersion } from "@/engine/load-content";
import { getInsightEntry } from "@/insights/library";

describe("release readiness", () => {
  it("requires explicit prototype publishing in production", () => {
    const model = loadModelVersion();
    expect(() =>
      assertReleaseReady(
        model,
        parseEnv({ NODE_ENV: "production", ALLOW_UNCALIBRATED: "false" }),
      ),
    ).toThrow("Uncalibrated model");
    expect(() =>
      assertReleaseReady(
        model,
        parseEnv({ NODE_ENV: "production", ALLOW_UNCALIBRATED: "true" }),
      ),
    ).not.toThrow();
  });
  it("excludes unreviewed active insights unless explicitly allowed", () => {
    expect(getInsightEntry("E", "high", { allowDrafts: false })).toBeUndefined();
    expect(getInsightEntry("E", "high", { allowDrafts: true })?.reviewStatus).toBe(
      "draft",
    );
  });
  it("blocks shipping draft copy without the explicit prototype flag", () => {
    const model = { ...loadModelVersion(), bankStatus: "calibrated" as const };
    const config = parseEnv({ NODE_ENV: "production", ALLOW_DRAFT_CONTENT: "false" });
    expect(() => assertReleaseReady(model, config, true)).toThrow("Unreviewed insights");
    expect(() =>
      assertReleaseReady(model, { ...config, ALLOW_DRAFT_CONTENT: true }, true),
    ).not.toThrow();
  });
});
