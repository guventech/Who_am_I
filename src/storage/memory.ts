import type { ScoredSession } from "@/engine/score";
import { completionSessionCode, hashSessionCode } from "./session-code";
import { completionFingerprint } from "./completion-fingerprint";
import type {
  CompletionPayload,
  DeleteResult,
  FeedbackPayload,
  SaveCompletionResult,
  StorageAdapter,
} from "./types";

export type MemorySessionRow = {
  id: string;
  codeHash: string;
  modelVersion: string;
  payload: CompletionPayload;
  scored: ScoredSession;
  createdAt: number;
  retakeOfId: string | null;
  feedback: FeedbackPayload | null;
  completionFingerprint: string;
};

/** In-process store for local/dev/e2e when Convex is not configured. */
export class MemoryAdapter implements StorageAdapter {
  private sessions = new Map<string, MemorySessionRow>();
  private byHash = new Map<string, string>();

  constructor(
    private readonly scoredByPayload: (p: CompletionPayload) => ScoredSession,
  ) {}

  async saveCompletion(
    payload: CompletionPayload,
    validatedScore?: ScoredSession,
  ): Promise<SaveCompletionResult> {
    const sessionCode = await completionSessionCode(payload.completionId);
    const codeHash = await hashSessionCode(sessionCode);
    const fingerprint = await completionFingerprint(payload);
    let retakeOfId: string | null = null;
    if (payload.previousSessionCode) {
      const prevHash = await hashSessionCode(payload.previousSessionCode);
      const prevId = this.byHash.get(prevHash);
      if (prevId) retakeOfId = prevId;
    }
    const existingId = this.byHash.get(codeHash);
    if (existingId) {
      if (this.sessions.get(existingId)?.completionFingerprint !== fingerprint) {
        throw new Error("completion_conflict");
      }
      return { sessionCode };
    }
    const id = `mem_${this.sessions.size + 1}_${Date.now()}`;
    const row: MemorySessionRow = {
      id,
      codeHash,
      modelVersion: payload.modelVersionId,
      payload,
      scored: validatedScore ?? this.scoredByPayload(payload),
      createdAt: Date.now(),
      retakeOfId,
      feedback: null,
      completionFingerprint: fingerprint,
    };
    this.sessions.set(id, row);
    this.byHash.set(codeHash, id);
    return { sessionCode };
  }

  async deleteByCode(sessionCode: string): Promise<DeleteResult> {
    const hash = await hashSessionCode(sessionCode);
    const rootId = this.byHash.get(hash);
    if (!rootId) return { deleted: false, sessionsRemoved: 0 };

    // Delete the session and any retakes that link to it (and the root itself).
    const toRemove = new Set<string>();
    const queue = [rootId];
    while (queue.length) {
      const id = queue.pop()!;
      if (toRemove.has(id)) continue;
      toRemove.add(id);
      for (const [otherId, row] of this.sessions) {
        if (row.retakeOfId === id) queue.push(otherId);
      }
    }

    // Also remove siblings that share the same code-hash chain via retakeOf pointing at removed roots
    for (const id of toRemove) {
      const row = this.sessions.get(id);
      if (!row) continue;
      this.byHash.delete(row.codeHash);
      this.sessions.delete(id);
    }
    return { deleted: true, sessionsRemoved: toRemove.size };
  }

  async saveFeedback(sessionCode: string, feedback: FeedbackPayload): Promise<void> {
    const hash = await hashSessionCode(sessionCode);
    const id = this.byHash.get(hash);
    if (!id) throw new Error("session_not_found");
    const row = this.sessions.get(id);
    if (!row) throw new Error("session_not_found");
    row.feedback = feedback;
  }

  /** Test/debug helper */
  getAll(): MemorySessionRow[] {
    return [...this.sessions.values()];
  }

  /** Retention: drop rows older than maxAgeMs. */
  purgeOlderThan(maxAgeMs: number, now = Date.now()): number {
    let removed = 0;
    for (const [id, row] of this.sessions) {
      if (now - row.createdAt > maxAgeMs) {
        this.byHash.delete(row.codeHash);
        this.sessions.delete(id);
        removed++;
      }
    }
    return removed;
  }
}

/** Shared singleton for Next.js API routes in one process. */
const globalStore = globalThis as unknown as {
  __whoamiMemory?: MemoryAdapter;
};

export function getMemoryAdapter(
  scoredByPayload: (p: CompletionPayload) => ScoredSession,
): MemoryAdapter {
  if (!globalStore.__whoamiMemory) {
    globalStore.__whoamiMemory = new MemoryAdapter(scoredByPayload);
  }
  return globalStore.__whoamiMemory;
}
