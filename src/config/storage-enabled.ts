import "server-only";

/** New answers and results are never saved on the server. */
export function isStorageEnabled(): boolean {
  return false;
}

/** Only supports deletion of records saved before server storage was retired. */
export function isLegacyDeletionEnabled(): boolean {
  const url = process.env.CONVEX_URL ?? "";
  const key = process.env.CONVEX_SERVER_KEY ?? "";
  const pepper = process.env.SESSION_CODE_PEPPER ?? "";
  return url.length > 0 && key.length > 0 && pepper.length > 0;
}

/** @deprecated Use isStorageEnabled */
export const isStorageUiEnabled = isStorageEnabled;
