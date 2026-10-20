import { z } from "zod";

export const insightEntrySchema = z.object({
  id: z.string().min(1),
  key: z.string().min(1),
  variant: z.enum(["firm", "soft"]),
  reviewStatus: z.enum(["draft", "reviewed"]),
  version: z.number().int().positive(),
  strengths: z
    .array(
      z.object({
        title: z.string().min(1),
        interviewLine: z.string().min(1),
        cvLine: z.string().min(1),
        teamLine: z.string().min(1),
      }),
    )
    .min(1),
  watchOuts: z.array(z.string().min(1)),
  improve: z.array(
    z.object({
      area: z.string().min(1),
      actions: z.array(z.string().min(1)).min(2).max(3),
    }),
  ),
  workWithOthers: z.string().min(1),
  tradeOff: z.string().min(1),
});

export const insightLibrarySchema = z.object({
  entries: z.array(insightEntrySchema),
});
