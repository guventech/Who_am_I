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
  constructor(
    private readonly baseUrl = "/api/storage",
    private readonly timeoutMs = 15_000,
  ) {}

  private async post(path: string, body: unknown): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await fetch(`${this.baseUrl}/${path}`, {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      // Consume the body inside the deadline too, rather than just waiting for headers.
      const text = await response.text();
      return new Response(text, { status: response.status, headers: response.headers });
    } catch (error) {
      if (controller.signal.aborted) throw new Error("request_timeout");
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  private headers(): HeadersInit {
    return {
      "content-type": "application/json",
      "x-rate-bucket": getClientRateBucket(),
    };
  }

  async saveCompletion(payload: CompletionPayload): Promise<SaveCompletionResult> {
    const res = await this.post("complete", payload);
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(body.error ?? `save_failed_${res.status}`);
    }
    return (await res.json()) as SaveCompletionResult;
  }

  async deleteByCode(sessionCode: string): Promise<DeleteResult> {
    const res = await this.post("delete", { sessionCode });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(body.error ?? `delete_failed_${res.status}`);
    }
    return (await res.json()) as DeleteResult;
  }

  async saveFeedback(sessionCode: string, feedback: FeedbackPayload): Promise<void> {
    const res = await this.post("feedback", { sessionCode, feedback });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(body.error ?? `feedback_failed_${res.status}`);
    }
  }
}
