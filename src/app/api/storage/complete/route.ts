import { NextResponse } from "next/server";
import { assertStorageConsent } from "@/storage/consent-gate";
import { allowRoutedRequest } from "@/storage/rate-limit";
import { completeWithRescore } from "@/storage/server-store";
import type { CompletionPayload } from "@/storage/types";

export async function POST(request: Request) {
  if (!allowRoutedRequest(request, "complete", 30, 10)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let payload: CompletionPayload;
  try {
    payload = (await request.json()) as CompletionPayload;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const consent = assertStorageConsent(payload);
  if (!consent.ok) {
    return NextResponse.json({ error: consent.reason }, { status: 403 });
  }

  try {
    const result = await completeWithRescore(payload);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "save_failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
