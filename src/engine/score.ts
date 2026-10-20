import { traitScoresFromPosterior } from "./bands";
import { computeQualityFlags } from "./flags";
import { scoreResponses } from "./grid";
import type {
  AnsweredItem,
  ItemBank,
  ModelVersion,
  QualityFlags,
  TraitScore,
} from "./types";
import { modelTraitIds } from "./types";

export type ScoredSession = {
  traits: TraitScore[];
  flags: QualityFlags;
};

export function scoreSession(
  bank: ItemBank,
  model: ModelVersion,
  answered: AnsweredItem[],
): ScoredSession {
  const flags = computeQualityFlags(answered);
  const posterior = scoreResponses(bank, model, answered);
  const traits = traitScoresFromPosterior(
    posterior,
    model.normMean,
    model.normSd,
    model.config,
    flags.any,
    modelTraitIds(model),
  );
  return { traits, flags };
}
