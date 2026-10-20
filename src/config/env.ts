import { z } from "zod";

const boolFromEnv = z
  .union([z.boolean(), z.string()])
  .optional()
  .transform((value) => {
    if (typeof value === "boolean") return value;
    if (value === undefined) return undefined;
    const normalized = value.trim().toLowerCase();
    if (["1", "true", "yes", "on"].includes(normalized)) return true;
    if (["0", "false", "no", "off", ""].includes(normalized)) return false;
    return undefined;
  });

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  ALLOW_UNCALIBRATED: boolFromEnv,
  ALLOW_DRAFT_CONTENT: boolFromEnv,
  /** Explicit production opt-in for go-deeper (also requires licensed H-H items). */
  ENABLE_GO_DEEPER: boolFromEnv,
});

export type AppEnv = {
  NODE_ENV: "development" | "test" | "production";
  ALLOW_UNCALIBRATED: boolean;
  ALLOW_DRAFT_CONTENT: boolean;
  ENABLE_GO_DEEPER: boolean;
};

function defaultAllowInNonProduction(nodeEnv: AppEnv["NODE_ENV"]): boolean {
  return nodeEnv !== "production";
}

/**
 * Parse process env with Zod. Safe defaults: allow uncalibrated/draft content
 * outside production builds.
 */
export function parseEnv(
  raw: Record<string, string | undefined> = process.env,
): AppEnv {
  const parsed = envSchema.parse({
    NODE_ENV: raw.NODE_ENV,
    ALLOW_UNCALIBRATED: raw.ALLOW_UNCALIBRATED,
    ALLOW_DRAFT_CONTENT: raw.ALLOW_DRAFT_CONTENT,
    ENABLE_GO_DEEPER: raw.ENABLE_GO_DEEPER,
  });

  const allowDefault = defaultAllowInNonProduction(parsed.NODE_ENV);

  return {
    NODE_ENV: parsed.NODE_ENV,
    ALLOW_UNCALIBRATED: parsed.ALLOW_UNCALIBRATED ?? allowDefault,
    ALLOW_DRAFT_CONTENT: parsed.ALLOW_DRAFT_CONTENT ?? allowDefault,
    // Dev/test: mechanism on by default. Production: off until licensed H-H + flag.
    ENABLE_GO_DEEPER: parsed.ENABLE_GO_DEEPER ?? allowDefault,
  };
}

export const env: AppEnv = parseEnv();
