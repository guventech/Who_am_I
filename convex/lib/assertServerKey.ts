/**
 * Shared secret gate for public Convex mutations.
 * CONVEX_SERVER_KEY must be set in the Convex deployment env.
 * Never log or return the key.
 */

function timingSafeEqualString(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length);
  let mismatch = a.length === b.length ? 0 : 1;
  for (let i = 0; i < len; i++) {
    const ca = i < a.length ? a.charCodeAt(i) : 0;
    const cb = i < b.length ? b.charCodeAt(i) : 0;
    mismatch |= ca ^ cb;
  }
  return mismatch === 0;
}

export function assertServerKey(key: string): void {
  const expected = process.env.CONVEX_SERVER_KEY;
  if (
    typeof expected !== "string" ||
    expected.length === 0 ||
    typeof key !== "string" ||
    !timingSafeEqualString(key, expected)
  ) {
    throw new Error("unauthorized");
  }
}
