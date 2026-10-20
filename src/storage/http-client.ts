import { getClientRateBucket } from "@/lib/rate-bucket";
import type {
  CompletionPayload,
  DeleteResult,
  FeedbackPayload,
  SaveCompletionResult,
  StorageAdapter,
} from "./types";

/**
 * Browser adapter used only after consent. Hits same-origin API routes
 * (which may forward to Convex or the in-memory store).
 */
export class HttpStorageAdapter implements StorageAdapter {
  constructor(private readonly baseUrl = "/api/storage") {}

  private headers(): HeadersInit {
    return {
      "content-type": "application/json",
      "x-rate-bucket": getClientRateBucket(),
    };
  }

  async saveCompletion(
    payload: CompletionPayload,
  ): Promise<SaveCompletionResult> {
    const res = await fetch(`${this.baseUrl}/complete`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(body.error ?? `save_failed_${res.status}`);
    }
    return (await res.json()) as SaveCompletionResult;
  }

  async deleteByCode(sessionCode: string): Promise<DeleteResult> {
    const res = await fetch(`${this.baseUrl}/delete`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({ sessionCode }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(body.error ?? `delete_failed_${res.status}`);
    }
    return (await res.json()) as DeleteResult;
  }

  async saveFeedback(
    sessionCode: string,
    feedback: FeedbackPayload,
  ): Promise<void> {
    const res = await fetch(`${this.baseUrl}/feedback`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({ sessionCode, feedback }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(body.error ?? `feedback_failed_${res.status}`);
    }
  }
}
