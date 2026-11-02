import { z } from "zod";

export const FEEDBACK_TOPICS = ["question", "results", "bug", "suggestion"] as const;
export const FEEDBACK_MAX_COMMENT = 4000;

export const contactFeedbackSchema = z.strictObject({
  submissionId: z.uuid(),
  topic: z.enum(FEEDBACK_TOPICS),
  comment: z.string().trim().min(1).max(FEEDBACK_MAX_COMMENT),
  email: z
    .string()
    .trim()
    .max(254)
    .pipe(z.union([z.email(), z.literal("")]))
    .default(""),
  website: z.string().trim().max(200).default(""),
});

export type ContactFeedback = z.infer<typeof contactFeedbackSchema>;
