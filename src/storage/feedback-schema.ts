import { z } from "zod";

const fitSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);

const traitIdSchema = z.enum(["E", "A", "C", "ES", "O", "H"]);

export const feedbackPayloadSchema = z.object({
  overallFit: fitSchema,
  traits: z
    .array(
      z.object({
        traitId: traitIdSchema,
        fit: fitSchema,
        off: z.enum(["too_high", "about_right", "too_low"]),
      }),
    )
    .max(6),
  insightThumbs: z
    .array(
      z.object({
        entryId: z.string().min(1).max(100),
        up: z.boolean(),
      }),
    )
    .max(50),
});
