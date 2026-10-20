import { internalMutation } from "./_generated/server";

const RETENTION_MS = 24 * 30 * 24 * 60 * 60 * 1000;

/** Delete or aggregate sessions older than 24 months. */
export const purgeExpired = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - RETENTION_MS;
    const old = await ctx.db
      .query("sessions")
      .withIndex("by_createdAt", (q) => q.lt("createdAt", cutoff))
      .take(100);

    let removed = 0;
    for (const session of old) {
      const sid = session._id;
      for (const table of [
        "responses",
        "scores",
        "feedback",
        "shownInsights",
        "demographics",
      ] as const) {
        const rows = await ctx.db
          .query(table)
          .withIndex("by_session", (q) => q.eq("sessionId", sid))
          .take(200);
        for (const row of rows) await ctx.db.delete(row._id);
      }
      await ctx.db.delete(sid);
      removed++;
    }
    return { removed };
  },
});
