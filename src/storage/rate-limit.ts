/**
 * Coarse in-memory rate limit without storing IPs.
 * Keys are HMAC-SHA256 of (IP + daily salt), truncated — the raw IP is not kept
 * past this function call. Client-supplied `x-rate-bucket` is ignored for the
 * limit (it was bypassable).
 */
import { createHmac } from "node:crypto";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function allowRequest(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): boolean {
  const existing = buckets.get(key);
  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (existing.count >= limit) return false;
  existing.count += 1;
  return true;
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real;
  return "unknown";
}

function dailySalt(): string {
  return (
    process.env.RATE_LIMIT_SALT ??
    process.env.SESSION_CODE_PEPPER ??
    "whoami-dev-rate-salt"
  );
}

/** Opaque HMAC bucket id — IP is hashed with a daily salt and discarded. */
export function hmacBucketFromRequest(request: Request): string {
  const day = new Date().toISOString().slice(0, 10);
  const ip = clientIp(request);
  return createHmac("sha256", dailySalt())
    .update(`${day}:${ip}`)
    .digest("hex")
    .slice(0, 32);
}

/** Build a rate-limit key for a route from the request (no IP storage). */
export function rateLimitKeyFromRequest(
  request: Request,
  route: string,
): { key: string; shared: boolean } {
  const hour = new Date().toISOString().slice(0, 13);
  const bucket = hmacBucketFromRequest(request);
  return { key: `${route}:${hour}:${bucket}`, shared: false };
}

export function allowRoutedRequest(
  request: Request,
  route: string,
  perClientLimit: number,
  _sharedLimit: number,
  windowMs = 60_000,
): boolean {
  const { key } = rateLimitKeyFromRequest(request, route);
  return allowRequest(key, perClientLimit, windowMs);
}
