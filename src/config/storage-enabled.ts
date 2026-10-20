import "server-only";

/**
 * Whether optional storage UI and APIs should be offered.
 * Production: Convex URL, server key, and session pepper must all be set.
 * Outside production: memory adapter is available (storage UI on).
 */
export function isStorageEnabled(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  const url = process.env.CONVEX_URL ?? "";
  const key = process.env.CONVEX_SERVER_KEY ?? "";
  const pepper = process.env.SESSION_CODE_PEPPER ?? "";
  return url.length > 0 && key.length > 0 && pepper.length > 0;
}

/** @deprecated Use isStorageEnabled */
export const isStorageUiEnabled = isStorageEnabled;
