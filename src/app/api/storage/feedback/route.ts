import { NextResponse } from "next/server";
import { allowRoutedRequest } from "@/storage/rate-limit";
import { feedbackStored } from "@/storage/server-store";
import type { FeedbackPayload } from "@/storage/types";

export async function POST(request: Request) {
  if (!allowRoutedRequest(request, "feedback", 30, 10)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: { sessionCode?: string; feedback?: FeedbackPayload };
  try {
    body = (await request.json()) as {
      sessionCode?: string;
      feedback?: FeedbackPayload;
    };
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body.sessionCode || !body.feedback) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  try {
    await feedbackStored(body.sessionCode.trim(), body.feedback);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "feedback_failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
