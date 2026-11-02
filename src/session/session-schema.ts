import { z } from "zod";
import { TRAIT_IDS } from "@/engine/types";

const finite = z.number().finite();
const trait = z.object({
  traitId: z.enum(TRAIT_IDS),
  slider: finite.min(-1).max(1),
  theta: finite,
  sd: finite,
  retakeLow: finite,
  retakeHigh: finite,
  credibleLow: finite,
  credibleHigh: finite,
  pLow: finite,
  pMid: finite,
  pHigh: finite,
  level: z.enum(["low", "mid", "high"]),
  confidence: z.enum(["firm", "soft", "unclear"]),
});
const scored = z.object({
  traits: z.array(trait),
  flags: z.object({ any: z.boolean(), fast: z.boolean(), straightline: z.boolean() }),
});
const answers = z.array(
  z.object({
    itemId: z.string(),
    value: z.union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
    ]),
    rtMs: finite,
    order: z.number().int().nonnegative(),
  }),
);

/** Validate stored input before any result or question component consumes it. */
export const sessionSchema = z
  .object({
    seed: finite,
    answered: answers,
    usedItemIds: z.array(z.string()),
    completed: z.boolean(),
    scored: scored.nullable(),
    round: z.enum(["core", "deeper"]).optional(),
    completionId: z.string().optional(),
    startDay: z.string().optional(),
    feedbackSentDay: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    sessionCode: z.string().nullable().optional(),
    storageSaved: z.boolean().optional(),
    storageError: z.string().nullable().optional(),
    shownInsightIds: z.array(z.string()).optional(),
    coreScored: scored.optional(),
    coreAnswered: answers.optional(),
    deeperStartCount: z.number().int().min(10).optional(),
  })
  .passthrough()
  .refine((value) => !value.completed || value.scored !== null)
  .refine(
    (value) =>
      value.round !== "deeper" ||
      (value.coreAnswered !== undefined &&
        value.coreAnswered.length >= 10 &&
        value.deeperStartCount !== undefined &&
        value.answered.length >= value.deeperStartCount),
  );
