import type { CompletionPayload } from "./types";

/** Server-side consent gate; never rely on the browser alone. */
export function assertStorageConsent(
  payload: Pick<CompletionPayload, "consentStore" | "ageConfirmed">,
): { ok: true } | { ok: false; reason: string } {
  if (payload.consentStore !== true || payload.ageConfirmed !== true) {
    return { ok: false, reason: "consent_required" };
  }
  return { ok: true };
}
