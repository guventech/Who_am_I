import { v } from "convex/values";
import { mutation, internalMutation } from "./lib/functions";
import { assertServerKey } from "./lib/assertServerKey";

const LIMITS = { complete: [30, 10], delete: [20, 8], feedback: [30, 10] } as const;

/** Atomic quotas shared by all Next.js instances. Contains opaque HMAC buckets only. */
export const consume = mutation({
  args: {
    serverKey: v.string(),
    bucket: v.string(),
    route: v.union(v.literal("complete"), v.literal("delete"), v.literal("feedback")),
    shared: v.boolean(),
  },
  handler: async (ctx, args) => {
    assertServerKey(args.serverKey);
    if (!/^[a-f0-9]{32}$/.test(args.bucket)) throw new Error("invalid_bucket");
    const now = Date.now();
    const expired = await ctx.db
      .query("rateLimits")
      .withIndex("by_resetAt", (q) => q.lt("resetAt", now))
      .take(10);
    for (const row of expired) await ctx.db.delete(row._id);
    const key = `${args.route}:${args.bucket}`;
    const limit = LIMITS[args.route][args.shared ? 1 : 0];
    const existing = await ctx.db
      .query("rateLimits")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();
    if (existing && existing.resetAt > now) {
      if (existing.count >= limit) return false;
      await ctx.db.patch(existing._id, { count: existing.count + 1 });
    } else if (existing) {
      await ctx.db.patch(existing._id, { count: 1, resetAt: now + 60_000 });
    } else {
      await ctx.db.insert("rateLimits", { key, count: 1, resetAt: now + 60_000 });
    }
    return true;
  },
});

/** Bound cleanup work per transaction; run frequently to reclaim transient rows. */
export const purgeExpired = internalMutation({
  args: {},
  handler: async (ctx) => {
    const expired = await ctx.db
      .query("rateLimits")
      .withIndex("by_resetAt", (q) => q.lt("resetAt", Date.now()))
      .take(1000);
    for (const row of expired) await ctx.db.delete(row._id);
    return expired.length;
  },
});
