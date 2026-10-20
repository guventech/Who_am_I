import type {
  CompletionPayload,
  DeleteResult,
  FeedbackPayload,
  SaveCompletionResult,
  StorageAdapter,
} from "./types";

/** Default adapter; no network, no persistence. */
export class NoopAdapter implements StorageAdapter {
  async saveCompletion(
    _payload: CompletionPayload,
  ): Promise<SaveCompletionResult> {
    void _payload;
    return { sessionCode: "" };
  }

  async deleteByCode(_sessionCode: string): Promise<DeleteResult> {
    void _sessionCode;
    return { deleted: false, sessionsRemoved: 0 };
  }

  async saveFeedback(
    _sessionCode: string,
    _feedback: FeedbackPayload,
  ): Promise<void> {
    void _sessionCode;
    void _feedback;
  }
}
