const KEY = "whoami-rate-bucket-v1";

/** Opaque per-browser bucket for API rate limiting (not a user id). */
export function getClientRateBucket(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    let value = sessionStorage.getItem(KEY);
    if (!value || value.length < 8) {
      value =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID().replace(/-/g, "")
          : `b${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(KEY, value);
    }
    return value.slice(0, 64);
  } catch {
    return `fallback${Date.now().toString(36)}`;
  }
}
