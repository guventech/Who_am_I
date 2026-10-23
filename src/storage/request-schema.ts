import { z } from "zod";
import { feedbackPayloadSchema } from "./feedback-schema";

const id = z.string().min(1).max(100);
const traitId = z.enum(["E", "A", "C", "ES", "O", "H"]);
export const sessionCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-HJ-NP-Z2-9]{10,32}$/);

export const completionPayloadSchema = z.object({
  completionId: z.uuid().optional(),
  modelVersionId: id,
  responses: z
    .array(
      z.object({
        itemId: id,
        value: z.union([
          z.literal(1),
          z.literal(2),
          z.literal(3),
          z.literal(4),
          z.literal(5),
        ]),
        rtMs: z.number().finite().min(0).max(86_400_000),
        order: z.number().int().min(0).max(29),
      }),
    )
    .min(10)
    .max(30),
  clientScores: z
    .array(
      z.object({
        traitId,
        slider: z.number().finite().min(-1).max(1),
        theta: z.number().finite().min(-20).max(20),
      }),
    )
    .min(5)
    .max(6),
  flags: z.object({ fast: z.boolean(), straightline: z.boolean(), any: z.boolean() }),
  shownInsightIds: z.array(id).max(15),
  deviceClass: z.enum(["mobile", "tablet", "desktop", "unknown"]),
  startDay: z.iso.date(),
  locale: z.literal("en"),
  retakeLater: z.boolean(),
  consentStore: z.boolean(),
  ageConfirmed: z.boolean(),
  previousSessionCode: sessionCodeSchema.optional(),
});

export const deleteRequestSchema = z.object({ sessionCode: sessionCodeSchema });
export const feedbackRequestSchema = deleteRequestSchema.extend({
  feedback: feedbackPayloadSchema,
});
