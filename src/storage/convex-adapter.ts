import "server-only";

import { loadModelVersion } from "@/content/server-content";
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

/**
 * Convex-backed adapter (server only). Requires CONVEX_URL + CONVEX_SERVER_KEY.
 * Human task: confirm Convex EU region availability (brief §14).
 */
export class ConvexAdapter implements StorageAdapter {
  constructor(
    private readonly client: {
      mutation: (name: string, args: Record<string, unknown>) => Promise<unknown>;
    },
    private readonly serverKey: string,
    private readonly score: (p: CompletionPayload) => ScoredSession,
  ) {}

  async saveCompletion(
    payload: CompletionPayload,
    validatedScore?: ScoredSession,
  ): Promise<SaveCompletionResult> {
    const sessionCode = await completionSessionCode(payload.completionId);
    const codeHash = await hashSessionCode(sessionCode);
    const fingerprint = await completionFingerprint(payload);
    const scored = validatedScore ?? this.score(payload);
    const result = (await this.client.mutation("sessions:saveCompletion", {
      serverKey: this.serverKey,
      payload: {
        modelVersionId: payload.modelVersionId,
        responses: payload.responses,
        clientScores: payload.clientScores,
        flags: scored.flags,
        shownInsightIds: payload.shownInsightIds,
        deviceClass: payload.deviceClass,
        startDay: payload.startDay,
        locale: "en" as const,
        retakeLater: payload.retakeLater,
        previousSessionCode: payload.previousSessionCode,
        codeHash,
        completionFingerprint: fingerprint,
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

  async saveFeedback(sessionCode: string, feedback: FeedbackPayload): Promise<void> {
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
