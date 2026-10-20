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
  NODE_ENV: z.enum(["development", "test", "production"]),
  ALLOW_UNCALIBRATED: boolFromEnv,
  ALLOW_DRAFT_CONTENT: boolFromEnv,
  /** Prefer NEXT_PUBLIC_ so the client bundle can read the flag. */
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

function asNodeEnv(
  value: string | undefined,
): AppEnv["NODE_ENV"] | undefined {
  if (
    value === "production" ||
    value === "test" ||
    value === "development"
  ) {
    return value;
  }
  return undefined;
}

/**
 * Read env with literal `process.env.KEY` access so Next can inline values.
 * Never pass the whole `process.env` object from the client; it is empty there
 * and would wrongly default NODE_ENV to development.
 *
 * When `raw` is passed (tests), its keys win over `process.env`.
 * Missing NODE_ENV ⇒ production (flags off).
 */
export function parseEnv(
  raw?: Record<string, string | undefined>,
): AppEnv {
  const nodeEnv =
    asNodeEnv(raw?.NODE_ENV) ??
    asNodeEnv(process.env.NODE_ENV) ??
    "production";

  const goDeeperRaw =
    raw?.NEXT_PUBLIC_ENABLE_GO_DEEPER ??
    raw?.ENABLE_GO_DEEPER ??
    process.env.NEXT_PUBLIC_ENABLE_GO_DEEPER ??
    process.env.ENABLE_GO_DEEPER;

  const parsed = envSchema.parse({
    NODE_ENV: nodeEnv,
    ALLOW_UNCALIBRATED:
      raw?.ALLOW_UNCALIBRATED ?? process.env.ALLOW_UNCALIBRATED,
    ALLOW_DRAFT_CONTENT:
      raw?.ALLOW_DRAFT_CONTENT ?? process.env.ALLOW_DRAFT_CONTENT,
    ENABLE_GO_DEEPER: goDeeperRaw,
  });

  const allowDefault = defaultAllowInNonProduction(parsed.NODE_ENV);

  return {
    NODE_ENV: parsed.NODE_ENV,
    ALLOW_UNCALIBRATED: parsed.ALLOW_UNCALIBRATED ?? allowDefault,
    ALLOW_DRAFT_CONTENT: parsed.ALLOW_DRAFT_CONTENT ?? allowDefault,
    // Off in production unless explicitly enabled (and H-H verified; see go-deeper.ts).
    ENABLE_GO_DEEPER: parsed.ENABLE_GO_DEEPER ?? allowDefault,
  };
}

export const env: AppEnv = parseEnv();
