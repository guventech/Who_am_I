import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { assertServerKey } from "./lib/assertServerKey";

/**
 * Convex mutations for consented storage.
 * Server re-scoring happens in Next.js API before calling these
 * (engine is TS in-repo; keep Convex payloads already validated).
 *
 * Every public mutation requires serverKey matching CONVEX_SERVER_KEY.
 * Note: `convex/_generated` appears after `npx convex dev`.
 */

const payloadValidator = v.object({
  modelVersionId: v.string(),
  responses: v.array(
    v.object({
      itemId: v.string(),
      value: v.number(),
      rtMs: v.number(),
      order: v.number(),
    }),
  ),
  clientScores: v.array(
    v.object({
      traitId: v.string(),
      slider: v.number(),
      theta: v.number(),
    }),
  ),
  flags: v.object({
    fast: v.boolean(),
    straightline: v.boolean(),
    any: v.boolean(),
  }),
  shownInsightIds: v.array(v.string()),
  deviceClass: v.string(),
  startDay: v.string(),
  locale: v.literal("en"),
  retakeLater: v.boolean(),
  previousSessionCode: v.optional(v.string()),
  /** Precomputed on the Next server; plaintext code never stored. */
  codeHash: v.string(),
  sessionCodePlaintextForClient: v.string(),
  scoredTraits: v.array(
    v.object({
      traitId: v.string(),
      theta: v.number(),
      sd: v.number(),
      slider: v.number(),
      level: v.string(),
      confidence: v.string(),
    }),
  ),
});

export const saveCompletion = mutation({
  args: { serverKey: v.string(), payload: payloadValidator },
  handler: async (ctx, { serverKey, payload }) => {
    assertServerKey(serverKey);
    const sessionId = await ctx.db.insert("sessions", {
      codeHash: payload.codeHash,
      modelVersion: payload.modelVersionId,
      deviceClass: payload.deviceClass,
      startDay: payload.startDay,
      locale: "en",
      retakeLater: payload.retakeLater,
      flags: payload.flags,
      createdAt: Date.now(),
    });

    for (const r of payload.responses) {
      await ctx.db.insert("responses", {
        sessionId,
        modelVersion: payload.modelVersionId,
        itemId: r.itemId,
        value: r.value,
        rtMs: r.rtMs,
        order: r.order,
      });
    }
    for (const t of payload.scoredTraits) {
      await ctx.db.insert("scores", {
        sessionId,
        modelVersion: payload.modelVersionId,
        traitId: t.traitId,
        theta: t.theta,
        sd: t.sd,
        slider: t.slider,
        level: t.level,
        confidence: t.confidence,
      });
    }
    for (const entryId of payload.shownInsightIds) {
      await ctx.db.insert("shownInsights", {
        sessionId,
        modelVersion: payload.modelVersionId,
        entryId,
      });
    }

    return { sessionCode: payload.sessionCodePlaintextForClient };
  },
});

export const deleteByCode = mutation({
  args: { serverKey: v.string(), codeHash: v.string() },
  handler: async (ctx, { serverKey, codeHash }) => {
    assertServerKey(serverKey);
    const roots = await ctx.db
      .query("sessions")
      .withIndex("by_codeHash", (q) => q.eq("codeHash", codeHash))
      .take(20);
    if (roots.length === 0) {
      return { deleted: false, sessionsRemoved: 0 };
    }

    let removed = 0;
    for (const session of roots) {
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
    return { deleted: true, sessionsRemoved: removed };
  },
});

export const saveFeedback = mutation({
  args: {
    serverKey: v.string(),
    codeHash: v.string(),
    modelVersion: v.string(),
    overallFit: v.number(),
    traitsJson: v.string(),
    insightThumbsJson: v.string(),
  },
  handler: async (ctx, args) => {
    assertServerKey(args.serverKey);
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_codeHash", (q) => q.eq("codeHash", args.codeHash))
      .unique();
    if (!session) throw new Error("session_not_found");
    await ctx.db.insert("feedback", {
      sessionId: session._id,
      modelVersion: args.modelVersion,
      overallFit: args.overallFit,
      traitsJson: args.traitsJson,
      insightThumbsJson: args.insightThumbsJson,
      createdAt: Date.now(),
    });
  },
});
