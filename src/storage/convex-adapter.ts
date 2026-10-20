import "server-only";

import { loadModelVersion } from "@/engine/load-content";
import type { ScoredSession } from "@/engine/score";
import { generateSessionCode, hashSessionCode } from "./session-code";
import type {
  CompletionPayload,
  DeleteResult,
  FeedbackPayload,
  SaveCompletionResult,
  StorageAdapter,
} from "./types";

/**
 * Convex-backed adapter (server only). Requires CONVEX_URL + CONVEX_SERVER_KEY.
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
    private readonly serverKey: string,
    private readonly score: (p: CompletionPayload) => ScoredSession,
  ) {}

  async saveCompletion(
    payload: CompletionPayload,
  ): Promise<SaveCompletionResult> {
    const sessionCode = generateSessionCode();
    const codeHash = await hashSessionCode(sessionCode);
    const scored = this.score(payload);
    const result = (await this.client.mutation("sessions:saveCompletion", {
      serverKey: this.serverKey,
      payload: {
        modelVersionId: payload.modelVersionId,
        responses: payload.responses,
        clientScores: payload.clientScores,
        flags: payload.flags,
        shownInsightIds: payload.shownInsightIds,
        deviceClass: payload.deviceClass,
        startDay: payload.startDay,
        locale: "en" as const,
        retakeLater: payload.retakeLater,
        previousSessionCode: payload.previousSessionCode,
        codeHash,
        sessionCodePlaintextForClient: sessionCode,
        scoredTraits: scored.traits.map((t) => ({
          traitId: t.traitId,
          theta: t.theta,
          sd: t.sd,
          slider: t.slider,
          level: t.level,
          confidence: t.confidence,
        })),
      },
    })) as SaveCompletionResult;
    return result;
  }

  async deleteByCode(sessionCode: string): Promise<DeleteResult> {
    const codeHash = await hashSessionCode(sessionCode);
    return (await this.client.mutation("sessions:deleteByCode", {
      serverKey: this.serverKey,
      codeHash,
    })) as DeleteResult;
  }

  async saveFeedback(
    sessionCode: string,
    feedback: FeedbackPayload,
  ): Promise<void> {
    const codeHash = await hashSessionCode(sessionCode);
    const model = loadModelVersion();
    await this.client.mutation("sessions:saveFeedback", {
      serverKey: this.serverKey,
      codeHash,
      modelVersion: model.id,
      overallFit: feedback.overallFit,
      traitsJson: JSON.stringify(feedback.traits),
      insightThumbsJson: JSON.stringify(feedback.insightThumbs),
    });
  }
}
