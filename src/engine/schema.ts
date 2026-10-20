import { z } from "zod";

export const traitIdSchema = z.enum(["E", "A", "C", "ES", "O", "H"]);

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

const modelConfigSchema = z.object({
  RETAKE_BAND_MULTIPLIER: z.number().positive(),
  UNCLEAR_WIDTH: z.number().positive(),
  P_LEVEL_FIRM: z.number().min(0).max(1),
  LEVEL_CUT: z.number().min(0).max(1),
  DEEPER_SD_TARGET: z.number().positive(),
  DEEPER_BUDGET_MAX: z.number().int().min(12).max(20),
  FLAG_BAND_FACTOR: z.number().positive(),
  GRID_NODES_PER_DIM: z.number().int().positive(),
  ACCURACY_CLAIMS: z.object({
    corrWithLongTest: z.tuple([z.number(), z.number()]).nullable(),
    retest: z.number().nullable(),
  }),
});

export const modelVersionSchema = z
  .object({
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
    priorCov: z.array(z.number()),
    normSampleId: z.string(),
    normsLabel: z.string(),
    normMean: z.array(z.number()),
    normSd: z.array(z.number()),
    itemHashes: z.record(z.string(), z.string()),
    fixedFormOrder: z.array(z.string()),
    config: modelConfigSchema,
  })
  .superRefine((model, ctx) => {
    const dim = model.traits.length;
    if (dim !== 5 && dim !== 6) {
      ctx.addIssue({
        code: "custom",
        message: `traits.length must be 5 (core) or 6 (deeper), got ${dim}`,
        path: ["traits"],
      });
    }
    if (model.priorCov.length !== dim * dim) {
      ctx.addIssue({
        code: "custom",
        message: `priorCov length ${model.priorCov.length} != dim² (${dim * dim})`,
        path: ["priorCov"],
      });
    }
    if (model.normMean.length !== dim || model.normSd.length !== dim) {
      ctx.addIssue({
        code: "custom",
        message: "normMean/normSd length must match traits.length",
        path: ["normMean"],
      });
    }
  });
