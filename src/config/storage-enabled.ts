/**
 * Whether the optional storage UI and APIs should be offered.
 * Production requires Convex; local/dev/test may use the memory adapter.
 */
export function isStorageUiEnabled(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  const url =
    process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL ?? "";
  return url.length > 0;
}
