import "server-only";

import { ConvexHttpClient } from "convex/browser";
import { isStorageEnabled } from "@/config/storage-enabled";
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
  const url = process.env.CONVEX_URL;
  return typeof url === "string" && url.length > 0 ? url : undefined;
}

function convexServerKey(): string | undefined {
  const key = process.env.CONVEX_SERVER_KEY;
  return typeof key === "string" && key.length > 0 ? key : undefined;
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
 * Server-side store: Convex when production storage is fully configured;
 * Memory outside production. Production without storage throws storage_unavailable.
 */
export function getServerStorage(): StorageAdapter {
  const url = convexUrl();
  const serverKey = convexServerKey();
  if (
    process.env.NODE_ENV === "production" &&
    url &&
    serverKey &&
    isStorageEnabled()
  ) {
    const client = new ConvexHttpClient(url);
    return new ConvexAdapter(
      {
        mutation: (name, args) =>
          client.mutation(name as never, args as never),
      },
      serverKey,
      (payload) => {
        const bank = loadItemBank();
        const model = resolveModel(payload.modelVersionId);
        const result = validateAndRescore(payload, bank, model);
        if (!result.ok) throw new Error(result.reason);
        return result.scored;
      },
    );
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("storage_unavailable");
  }

  // Dev/test: prefer Convex when URL + key are set, else memory.
  if (url && serverKey) {
    const client = new ConvexHttpClient(url);
    return new ConvexAdapter(
      {
        mutation: (name, args) =>
          client.mutation(name as never, args as never),
      },
      serverKey,
      (payload) => {
        const bank = loadItemBank();
        const model = resolveModel(payload.modelVersionId);
        const result = validateAndRescore(payload, bank, model);
        if (!result.ok) throw new Error(result.reason);
        return result.scored;
      },
    );
  }

  return memoryStore();
}

export function getMemoryStoreForTests(): MemoryAdapter {
  return memoryStore();
}

function assertStorageAvailable(): void {
  if (!isStorageEnabled()) {
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

/** 24 months in ms - retention job target. */
export const RETENTION_MS = 24 * 30 * 24 * 60 * 60 * 1000;

export function runRetentionPurge(now = Date.now()): number {
  if (!isStorageEnabled()) {
    return 0;
  }
  if (process.env.NODE_ENV === "production" && !convexUrl()) {
    return 0;
  }
  const store = getServerStorage();
  if ("purgeOlderThan" in store && typeof store.purgeOlderThan === "function") {
    return (store as MemoryAdapter).purgeOlderThan(RETENTION_MS, now);
  }
  return 0;
}
