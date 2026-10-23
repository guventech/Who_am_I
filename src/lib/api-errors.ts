import { NextResponse } from "next/server";

/** Map storage/domain errors to HTTP status codes. */
export function jsonError(message: string) {
  if (message.includes("completion_conflict")) {
    return NextResponse.json({ error: "completion_conflict" }, { status: 409 });
  }
  if (message.includes("session_not_found")) {
    return NextResponse.json({ error: "session_not_found" }, { status: 404 });
  }
  const invalid =
    /^(unknown_model_version|model_version_mismatch|locale_must_be_en|response_count|incomplete_form|response_order|unexpected_item|unknown_item|duplicate_item|value_out_of_range|bad_rt|score_length_mismatch|missing_trait|invalid_score|slider_mismatch|theta_mismatch)(:|$)/.test(
      message,
    );
  return NextResponse.json(
    { error: invalid ? message : "storage_unavailable" },
    { status: invalid ? 400 : 503 },
  );
}
