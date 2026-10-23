import type { CompletionPayload } from "./types";

/** Bind a retry ID to its original answers and metadata without retaining plaintext. */
export async function completionFingerprint(payload: CompletionPayload): Promise<string> {
  const canonical = JSON.stringify([
    payload.modelVersionId,
    payload.responses.map((r) => [r.itemId, r.value, r.rtMs, r.order]),
    payload.shownInsightIds,
    payload.deviceClass,
    payload.startDay,
    payload.locale,
    payload.retakeLater,
    payload.previousSessionCode ?? null,
  ]);
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(canonical),
  );
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
