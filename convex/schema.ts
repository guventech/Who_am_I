import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Convex schema (trimmed) — brief §10.
 * Deploy with `npx convex dev` when EU region is confirmed.
 */
export default defineSchema({
  sessions: defineTable({
    codeHash: v.string(),
    modelVersion: v.string(),
    deviceClass: v.string(),
    startDay: v.string(),
    locale: v.literal("en"),
    retakeLater: v.boolean(),
    retakeOfSessionId: v.optional(v.id("sessions")),
    flags: v.object({
      fast: v.boolean(),
      straightline: v.boolean(),
      any: v.boolean(),
    }),
    createdAt: v.number(),
  })
    .index("by_codeHash", ["codeHash"])
    .index("by_createdAt", ["createdAt"]),

  responses: defineTable({
    sessionId: v.id("sessions"),
    modelVersion: v.string(),
    itemId: v.string(),
    value: v.number(),
    rtMs: v.number(),
    order: v.number(),
  }).index("by_session", ["sessionId"]),

  scores: defineTable({
    sessionId: v.id("sessions"),
    modelVersion: v.string(),
    traitId: v.string(),
    theta: v.number(),
    sd: v.number(),
    slider: v.number(),
    level: v.string(),
    confidence: v.string(),
  }).index("by_session", ["sessionId"]),

  feedback: defineTable({
    sessionId: v.id("sessions"),
    modelVersion: v.string(),
    overallFit: v.number(),
    traitsJson: v.string(),
    insightThumbsJson: v.string(),
    createdAt: v.number(),
  }).index("by_session", ["sessionId"]),

  shownInsights: defineTable({
    sessionId: v.id("sessions"),
    modelVersion: v.string(),
    entryId: v.string(),
  }).index("by_session", ["sessionId"]),

  demographics: defineTable({
    sessionId: v.id("sessions"),
    modelVersion: v.string(),
    ageBand: v.string(),
  }).index("by_session", ["sessionId"]),
});
