import type { AppEnv } from "./env";
import type { ModelVersion } from "@/engine/types";

/** A published prototype requires an explicit server-side opt-in. */
export function assertReleaseReady(
  model: ModelVersion,
  config: AppEnv,
  hasDraftInsights = false,
): void {
  if (
    config.NODE_ENV === "production" &&
    model.bankStatus !== "calibrated" &&
    !config.ALLOW_UNCALIBRATED
  ) {
    throw new Error(
      "Uncalibrated model: set ALLOW_UNCALIBRATED=true only for an intentional prototype release.",
    );
  }
  if (
    config.NODE_ENV === "production" &&
    hasDraftInsights &&
    !config.ALLOW_DRAFT_CONTENT
  ) {
    throw new Error(
      "Unreviewed insights: review active content or set ALLOW_DRAFT_CONTENT=true for an intentional prototype release.",
    );
  }
}
