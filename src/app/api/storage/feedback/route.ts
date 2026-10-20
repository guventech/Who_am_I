import { NextResponse } from "next/server";
import { isStorageEnabled } from "@/config/storage-enabled";
import { jsonError } from "@/lib/api-errors";
import { feedbackPayloadSchema } from "@/storage/feedback-schema";
import { allowRoutedRequest } from "@/storage/rate-limit";
import { feedbackStored } from "@/storage/server-store";

export async function POST(request: Request) {
  if (!isStorageEnabled()) {
    return NextResponse.json({ error: "storage_unavailable" }, { status: 503 });
  }

  if (!allowRoutedRequest(request, "feedback", 30, 10)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: { sessionCode?: string; feedback?: unknown };
  try {
    body = (await request.json()) as {
      sessionCode?: string;
      feedback?: unknown;
    };
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body.sessionCode || typeof body.sessionCode !== "string") {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const parsed = feedbackPayloadSchema.safeParse(body.feedback);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_feedback" }, { status: 400 });
  }

  try {
    await feedbackStored(body.sessionCode.trim(), parsed.data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "feedback_failed";
    return jsonError(message);
  }
}
