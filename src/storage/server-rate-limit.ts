import "server-only";
import { ConvexHttpClient } from "convex/browser";
import {
  allowRoutedRequest,
  hmacBucketFromRequest,
  rateLimitKeyFromRequest,
} from "./rate-limit";

type StorageRoute = "complete" | "delete" | "feedback";

export async function allowStorageRequest(
  request: Request,
  route: StorageRoute,
  limit: number,
  sharedLimit: number,
): Promise<boolean> {
  if (!allowRoutedRequest(request, route, limit, sharedLimit)) return false;
  const url = process.env.CONVEX_URL;
  const serverKey = process.env.CONVEX_SERVER_KEY;
  if (!url || !serverKey) return true; // Local/test memory storage only.
  try {
    const client = new ConvexHttpClient(url);
    const allowed = await client.mutation(
      "rateLimit:consume" as never,
      {
        serverKey,
        route,
        bucket: hmacBucketFromRequest(request),
        shared: rateLimitKeyFromRequest(request, route).shared,
      } as never,
    );
    return allowed === true;
  } catch {
    // A missing/offline limiter must not silently open expensive storage routes.
    throw new Error("storage_unavailable");
  }
}
