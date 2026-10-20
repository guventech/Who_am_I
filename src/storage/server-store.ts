import { ConvexHttpClient } from "convex/browser";
import {
  loadDeeperModelVersion,
  loadItemBank,
  loadModelVersion,
} from "@/engine/load-content";
import type { ModelVersion } from "@/engine/types";
import { ConvexAdapter } from "./convex-adapter";
import { getMemoryAdapter, type MemoryAdapter } from "./memory";
import { validateAndRescore } from "./rescore";
import type {
  CompletionPayload,
  DeleteResult,
  FeedbackPayload,
  SaveCompletionResult,
  StorageAdapter,
} from "./types";

function resolveModel(modelVersionId: string): ModelVersion {
  const core = loadModelVersion();
  if (modelVersionId === core.id) return core;
  const deeper = loadDeeperModelVersion();
  if (modelVersionId === deeper.id) return deeper;
  throw new Error(`unknown_model_version:${modelVersionId}`);
}

function convexUrl(): string | undefined {
  const url =
    process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL ?? undefined;
  return typeof url === "string" && url.length > 0 ? url : undefined;
}

/** True when durable storage (Convex) is configured. */
export function isDurableStorageConfigured(): boolean {
  return convexUrl() !== undefined;
}

function memoryStore(): MemoryAdapter {
  return getMemoryAdapter((payload) => {
    const bank = loadItemBank();
    const model = resolveModel(payload.modelVersionId);
    const result = validateAndRescore(payload, bank, model);
    if (!result.ok) {
      throw new Error(result.reason);
    }
    return result.scored;
  });
}

/**
 * Server-side store: Convex when URL is set; Memory outside production.
 * Production without Convex throws `storage_unavailable`.
 */
export function getServerStorage(): StorageAdapter {
  const url = convexUrl();
  if (url) {
    const client = new ConvexHttpClient(url);
    return new ConvexAdapter({
      mutation: (name, args) =>
        client.mutation(name as never, args as never),
    });
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("storage_unavailable");
  }

  return memoryStore();
}

export function getMemoryStoreForTests(): MemoryAdapter {
  return memoryStore();
}

function assertStorageAvailable(): void {
  if (process.env.NODE_ENV === "production" && !isDurableStorageConfigured()) {
    throw new Error("storage_unavailable");
  }
}

export async function completeWithRescore(
  payload: CompletionPayload,
): Promise<SaveCompletionResult> {
  assertStorageAvailable();
  const bank = loadItemBank();
  const model = resolveModel(payload.modelVersionId);
  const checked = validateAndRescore(payload, bank, model);
  if (!checked.ok) {
    throw new Error(checked.reason);
  }
  return getServerStorage().saveCompletion(payload);
}

export async function deleteStored(
  sessionCode: string,
): Promise<DeleteResult> {
  assertStorageAvailable();
  return getServerStorage().deleteByCode(sessionCode);
}

export async function feedbackStored(
  sessionCode: string,
  feedback: FeedbackPayload,
): Promise<void> {
  assertStorageAvailable();
  return getServerStorage().saveFeedback(sessionCode, feedback);
}

/** 24 months in ms — retention job target. */
export const RETENTION_MS = 24 * 30 * 24 * 60 * 60 * 1000;

export function runRetentionPurge(now = Date.now()): number {
  if (process.env.NODE_ENV === "production" && !isDurableStorageConfigured()) {
    return 0;
  }
  const store = getServerStorage();
  if ("purgeOlderThan" in store && typeof store.purgeOlderThan === "function") {
    return (store as MemoryAdapter).purgeOlderThan(RETENTION_MS, now);
  }
  return 0;
}
