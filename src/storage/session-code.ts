const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1
const DEV_PEPPER = "whoami-dev-pepper";

/** Cryptographic by default; an injected RNG is only for deterministic tests. */
export function generateSessionCode(rng?: () => number): string {
  const random = crypto.getRandomValues(new Uint8Array(10));
  let out = "";
  for (let i = 0; i < 10; i++) {
    out +=
      ALPHABET[rng ? Math.floor(rng() * ALPHABET.length) : random[i]! % ALPHABET.length]!;
  }
  return out;
}

/** A stable, unguessable recovery code across retries and server instances. */
export async function completionSessionCode(completionId?: string): Promise<string> {
  if (!completionId) return generateSessionCode();
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(sessionPepper()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = new Uint8Array(
    await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(`completion-v1:${completionId}`),
    ),
  );
  return [...digest.slice(0, 16)].map((b) => ALPHABET[b % ALPHABET.length]).join("");
}

function sessionPepper(): string {
  const pepper = process.env.SESSION_CODE_PEPPER;
  if (typeof pepper === "string" && pepper.length > 0) return pepper;
  if (process.env.NODE_ENV === "production") {
    throw new Error("pepper_missing");
  }
  return DEV_PEPPER;
}

export async function hashSessionCode(code: string): Promise<string> {
  const normalized = code.trim().toUpperCase();
  const pepper = sessionPepper();
  const data = new TextEncoder().encode(`whoami:${pepper}:${normalized}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifySessionCode(code: string, hash: string): Promise<boolean> {
  const computed = await hashSessionCode(code);
  return computed === hash;
}
