import { loadItemBank, loadModelVersion } from "@/engine/load-content";
import { getMemoryAdapter, type MemoryAdapter } from "./memory";
import { validateAndRescore } from "./rescore";
import type {
  CompletionPayload,
  DeleteResult,
  FeedbackPayload,
  SaveCompletionResult,
  StorageAdapter,
} from "./types";

/**
 * Server-side store: Memory when Convex URL is unset.
 * ConvexAdapter is used when NEXT_PUBLIC_CONVEX_URL / CONVEX_URL is set
 * (wired after `npx convex dev` generates clients).
 */
export function getServerStorage(): StorageAdapter {
  const bank = loadItemBank();
  const model = loadModelVersion();
  return getMemoryAdapter((payload) => {
    const result = validateAndRescore(payload, bank, model);
    if (!result.ok) {
      throw new Error(result.reason);
    }
    return result.scored;
  });
}

export function getMemoryStoreForTests(): MemoryAdapter {
  return getServerStorage() as MemoryAdapter;
}

export async function completeWithRescore(
  payload: CompletionPayload,
): Promise<SaveCompletionResult> {
  const bank = loadItemBank();
  const model = loadModelVersion();
  const checked = validateAndRescore(payload, bank, model);
  if (!checked.ok) {
    throw new Error(checked.reason);
  }
  return getServerStorage().saveCompletion(payload);
}

export async function deleteStored(
  sessionCode: string,
): Promise<DeleteResult> {
  return getServerStorage().deleteByCode(sessionCode);
}

export async function feedbackStored(
  sessionCode: string,
  feedback: FeedbackPayload,
): Promise<void> {
  return getServerStorage().saveFeedback(sessionCode, feedback);
}

/** 24 months in ms — retention job target. */
export const RETENTION_MS = 24 * 30 * 24 * 60 * 60 * 1000;

export function runRetentionPurge(now = Date.now()): number {
  const store = getServerStorage();
  if ("purgeOlderThan" in store && typeof store.purgeOlderThan === "function") {
    return (store as MemoryAdapter).purgeOlderThan(RETENTION_MS, now);
  }
  return 0;
}
