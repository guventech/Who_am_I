import type { AnsweredItem, QualityFlags, TraitId } from "@/engine/types";
import type { ScoredSession } from "@/engine/score";

export type DeviceClass = "mobile" | "tablet" | "desktop" | "unknown";

export type ClientTraitScore = {
  traitId: TraitId;
  slider: number;
  theta: number;
};

export type CompletionPayload = {
  /** Stable random ID for retrying the same completed run. */
  completionId?: string;
  modelVersionId: string;
  responses: AnsweredItem[];
  clientScores: ClientTraitScore[];
  flags: QualityFlags;
  shownInsightIds: string[];
  deviceClass: DeviceClass;
  /** Day-rounded start date YYYY-MM-DD (UTC). */
  startDay: string;
  locale: "en";
  retakeLater: boolean;
  /** Required on the wire; server rejects saves without both true. */
  consentStore: boolean;
  ageConfirmed: boolean;
  /** Optional: link to a previous session via its plaintext code. */
  previousSessionCode?: string;
};

export type TraitFeedback = {
  traitId: TraitId;
  fit: 1 | 2 | 3 | 4 | 5;
  off: "too_high" | "about_right" | "too_low";
};

export type FeedbackPayload = {
  overallFit: 1 | 2 | 3 | 4 | 5;
  traits: TraitFeedback[];
  insightThumbs: { entryId: string; up: boolean }[];
};

export type SaveCompletionResult = {
  sessionCode: string;
};

export type DeleteResult = {
  deleted: boolean;
  sessionsRemoved: number;
};

export interface StorageAdapter {
  saveCompletion(
    payload: CompletionPayload,
    scored?: ScoredSession,
  ): Promise<SaveCompletionResult>;
  deleteByCode(sessionCode: string): Promise<DeleteResult>;
  saveFeedback(sessionCode: string, feedback: FeedbackPayload): Promise<void>;
}
