import type {
  CompletionPayload,
  DeleteResult,
  FeedbackPayload,
  SaveCompletionResult,
  StorageAdapter,
} from "./types";

/**
 * Convex-backed adapter (server). Requires a configured deployment.
 * Until CONVEX_URL is set, server-store uses MemoryAdapter instead.
 *
 * Human task: confirm Convex EU region availability (brief §14).
 */
export class ConvexAdapter implements StorageAdapter {
  constructor(
    private readonly client: {
      mutation: (
        name: string,
        args: Record<string, unknown>,
      ) => Promise<unknown>;
    },
  ) {}

  async saveCompletion(
    payload: CompletionPayload,
  ): Promise<SaveCompletionResult> {
    const result = (await this.client.mutation("sessions:saveCompletion", {
      payload,
    })) as SaveCompletionResult;
    return result;
  }

  async deleteByCode(sessionCode: string): Promise<DeleteResult> {
    return (await this.client.mutation("sessions:deleteByCode", {
      sessionCode,
    })) as DeleteResult;
  }

  async saveFeedback(
    sessionCode: string,
    feedback: FeedbackPayload,
  ): Promise<void> {
    await this.client.mutation("sessions:saveFeedback", {
      sessionCode,
      feedback,
    });
  }
}
