import { describe, expect, it } from "vitest";
import { parseEnv } from "../src/config/env";
import {
  ENABLE_COLOURS,
  ENABLE_FREE_TEXT,
  ENABLE_LLM_REWORD,
} from "../src/config/flags";
import { copyEn } from "../src/content/copy.en";

describe("feature flags", () => {
  it("keeps deferred features off", () => {
    expect(ENABLE_COLOURS).toBe(false);
    expect(ENABLE_FREE_TEXT).toBe(false);
    expect(ENABLE_LLM_REWORD).toBe(false);
  });
});

describe("env schema", () => {
  it("parses empty env with non-production defaults", () => {
    const env = parseEnv({});
    expect(env.NODE_ENV).toBe("development");
    expect(env.ALLOW_UNCALIBRATED).toBe(true);
    expect(env.ALLOW_DRAFT_CONTENT).toBe(true);
  });

  it("defaults allow flags to false in production", () => {
    const env = parseEnv({ NODE_ENV: "production" });
    expect(env.ALLOW_UNCALIBRATED).toBe(false);
    expect(env.ALLOW_DRAFT_CONTENT).toBe(false);
    expect(env.ENABLE_GO_DEEPER).toBe(false);
  });

  it("honours explicit true allow flags in production", () => {
    const env = parseEnv({
      NODE_ENV: "production",
      ALLOW_UNCALIBRATED: "true",
      ALLOW_DRAFT_CONTENT: "1",
      ENABLE_GO_DEEPER: "true",
    });
    expect(env.ALLOW_UNCALIBRATED).toBe(true);
    expect(env.ALLOW_DRAFT_CONTENT).toBe(true);
    expect(env.ENABLE_GO_DEEPER).toBe(true);
  });
});

describe("english copy", () => {
  it("exposes Appendix A promise without accuracy numbers", () => {
    expect(copyEn.brand).toBe("Who Am I?");
    expect(copyEn.promise).toContain("10 questions");
    expect(copyEn.promise).not.toMatch(/\d\.\d{2}/);
    expect(copyEn.prototypeBanner).toBe("Prototype - scores not calibrated");
  });
});
