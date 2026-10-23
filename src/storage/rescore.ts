import { scoreSession, type ScoredSession } from "@/engine/score";
import type { ItemBank, ModelVersion, ResponseValue } from "@/engine/types";
import type { CompletionPayload } from "./types";

const SLIDER_EPS = 0.05;
const THETA_EPS = 0.15;
/** Core 10 + go-deeper budget max 20. */
const MAX_RESPONSES = 30;

export type RescoreOk = { ok: true; scored: ScoredSession };
export type RescoreErr = { ok: false; reason: string };
export type RescoreResult = RescoreOk | RescoreErr;

export function validateAndRescore(
  payload: CompletionPayload,
  bank: ItemBank,
  model: ModelVersion,
): RescoreResult {
  if (payload.modelVersionId !== model.id) {
    return { ok: false, reason: "model_version_mismatch" };
  }
  if (payload.locale !== "en") {
    return { ok: false, reason: "locale_must_be_en" };
  }
  if (payload.responses.length === 0 || payload.responses.length > MAX_RESPONSES) {
    return { ok: false, reason: "response_count" };
  }

  const knownIds = new Set(bank.items.map((i) => i.id));
  const coreCount = model.fixedFormOrder.length;
  const fixedIds = new Set(model.fixedFormOrder);
  const deeper = model.traits.some((t) => t.id === "H");
  if (
    (!deeper && payload.responses.length !== coreCount) ||
    (deeper && payload.responses.length < 10)
  ) {
    return { ok: false, reason: "incomplete_form" };
  }
  const seen = new Set<string>();
  for (const [index, r] of payload.responses.entries()) {
    if (r.order !== index) return { ok: false, reason: "response_order" };
    // The fixed form shuffles after Q1, so validate membership rather than bank order.
    if (
      !deeper &&
      (!fixedIds.has(r.itemId) ||
        (index === 0 && r.itemId !== model.config.FIXED_FIRST_ITEM_ID))
    ) {
      return { ok: false, reason: "unexpected_item" };
    }
    if (!knownIds.has(r.itemId)) {
      return { ok: false, reason: `unknown_item:${r.itemId}` };
    }
    if (seen.has(r.itemId)) {
      return { ok: false, reason: `duplicate_item:${r.itemId}` };
    }
    seen.add(r.itemId);
    if (![1, 2, 3, 4, 5].includes(r.value as number)) {
      return { ok: false, reason: "value_out_of_range" };
    }
    if (!Number.isFinite(r.rtMs) || r.rtMs < 0) {
      return { ok: false, reason: "bad_rt" };
    }
  }

  const scored = scoreSession(
    bank,
    model,
    payload.responses.map((r) => ({
      ...r,
      value: r.value as ResponseValue,
    })),
  );

  if (payload.clientScores.length !== scored.traits.length) {
    return { ok: false, reason: "score_length_mismatch" };
  }

  for (let i = 0; i < scored.traits.length; i++) {
    const server = scored.traits[i]!;
    const client = payload.clientScores.find((c) => c.traitId === server.traitId);
    if (!client) return { ok: false, reason: `missing_trait:${server.traitId}` };
    if (!Number.isFinite(client.slider) || !Number.isFinite(client.theta)) {
      return { ok: false, reason: "invalid_score" };
    }
    if (Math.abs(client.slider - server.slider) > SLIDER_EPS) {
      return { ok: false, reason: `slider_mismatch:${server.traitId}` };
    }
    if (Math.abs(client.theta - server.theta) > THETA_EPS) {
      return { ok: false, reason: `theta_mismatch:${server.traitId}` };
    }
  }

  return { ok: true, scored };
}
