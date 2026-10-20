const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1
const DEV_PEPPER = "whoami-dev-pepper";

/** Deterministic-friendly generator; pass Math.random in production. */
export function generateSessionCode(rng: () => number = Math.random): string {
  let out = "";
  for (let i = 0; i < 10; i++) {
    out += ALPHABET[Math.floor(rng() * ALPHABET.length)]!;
  }
  return out;
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
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifySessionCode(
  code: string,
  hash: string,
): Promise<boolean> {
  const computed = await hashSessionCode(code);
  return computed === hash;
}
