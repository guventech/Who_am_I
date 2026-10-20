/**
 * Coarse in-memory rate limit without storing IPs.
 * Prefer an opaque client bucket header (`x-rate-bucket`) so honest users
 * do not share one global counter. Missing/invalid header uses a shared
 * fallback with a tighter limit.
 */
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

const BUCKET_RE = /^[a-zA-Z0-9_-]{8,64}$/;

/** Build a rate-limit key for a route from the request (no IP storage). */
export function rateLimitKeyFromRequest(
  request: Request,
  route: string,
): { key: string; shared: boolean } {
  const hour = new Date().toISOString().slice(0, 13);
  const header = request.headers.get("x-rate-bucket");
  if (header && BUCKET_RE.test(header)) {
    return { key: `${route}:${hour}:${header}`, shared: false };
  }
  return { key: `${route}:${hour}:shared`, shared: true };
}

export function allowRoutedRequest(
  request: Request,
  route: string,
  perClientLimit: number,
  sharedLimit: number,
  windowMs = 60_000,
): boolean {
  const { key, shared } = rateLimitKeyFromRequest(request, route);
  return allowRequest(key, shared ? sharedLimit : perClientLimit, windowMs);
}
