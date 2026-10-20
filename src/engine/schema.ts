import { z } from "zod";

export const traitIdSchema = z.enum(["E", "A", "C", "ES", "O"]);

export const itemSchema = z.object({
  id: z.string().min(1),
  pool: z.enum(["core", "deeper"]),
  primaryTrait: traitIdSchema,
  loadings: z.record(z.string(), z.number()),
  thresholds: z.tuple([z.number(), z.number(), z.number(), z.number()]),
  keyed: z.union([z.literal(1), z.literal(-1)]),
  isAnchor: z.boolean(),
  status: z.enum(["active", "candidate", "retired"]),
  source: z.enum(["ipip", "original"]),
  sourceVerified: z.boolean(),
  version: z.number().int().positive(),
  secondaryEstimated: z.boolean().optional(),
});

export const itemBankSchema = z.object({
  version: z.number().int().nonnegative(),
  placeholderNote: z.string(),
  items: z.array(itemSchema),
});

export const modelVersionSchema = z.object({
  id: z.string(),
  bankStatus: z.enum(["dev-uncalibrated", "calibrated"]),
  traits: z.array(
    z.object({
      id: traitIdSchema,
      name: z.string(),
      poleLow: z.string(),
      poleHigh: z.string(),
    }),
  ),
  priorCov: z.array(z.number()).length(25),
  normSampleId: z.string(),
  normsLabel: z.string(),
  normMean: z.array(z.number()).length(5),
  normSd: z.array(z.number()).length(5),
  itemHashes: z.record(z.string(), z.string()),
  fixedFormOrder: z.array(z.string()),
  config: z.object({
    RETAKE_BAND_MULTIPLIER: z.number().positive(),
    UNCLEAR_WIDTH: z.number().positive(),
    P_LEVEL_FIRM: z.number().min(0).max(1),
    LEVEL_CUT: z.number().min(0).max(1),
    DEEPER_SD_TARGET: z.number().positive(),
    FLAG_BAND_FACTOR: z.number().positive(),
    ACCURACY_CLAIMS: z.object({
      corrWithLongTest: z.tuple([z.number(), z.number()]).nullable(),
      retest: z.number().nullable(),
    }),
  }),
});
