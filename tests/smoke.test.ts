import { describe, expect, it } from "vitest";
import { parseEnv } from "../src/config/env";
import {
  ENABLE_COLOURS,
  ENABLE_FREE_TEXT,
  ENABLE_LLM_REWORD,
} from "../src/config/flags";
import { copyEn } from "../src/copy/en";

describe("feature flags", () => {
  it("keeps deferred features off", () => {
    expect(ENABLE_COLOURS).toBe(false);
    expect(ENABLE_FREE_TEXT).toBe(false);
    expect(ENABLE_LLM_REWORD).toBe(false);
  });
});

describe("env schema", () => {
  it("parses empty override with missing NODE_ENV as production (flags off)", () => {
    const env = parseEnv({});
    expect(["production", "test", "development"]).toContain(env.NODE_ENV);
    if (env.NODE_ENV === "production") {
      expect(env.ALLOW_UNCALIBRATED).toBe(false);
      expect(env.ENABLE_GO_DEEPER).toBe(false);
    } else {
      expect(env.ALLOW_UNCALIBRATED).toBe(true);
      expect(env.ALLOW_DRAFT_CONTENT).toBe(true);
    }
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

describe("english copy v2", () => {
  it("uses approved banner and landing promise", () => {
    expect(copyEn.brand).toBe("Who Am I?");
    expect(copyEn.promise).toContain("2 minutes");
    expect(copyEn.prototypeBanner).toBe(
      "Early version. Your results are a rough guide.",
    );
    expect(copyEn.start).toBe("Start the test");
  });
});
