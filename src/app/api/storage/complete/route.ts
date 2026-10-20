import { NextResponse } from "next/server";
import { allowRequest } from "@/storage/rate-limit";
import { completeWithRescore } from "@/storage/server-store";
import type { CompletionPayload } from "@/storage/types";

export async function POST(request: Request) {
  const bucket = `complete:${new Date().toISOString().slice(0, 13)}`;
  if (!allowRequest(bucket, 60, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let payload: CompletionPayload;
  try {
    payload = (await request.json()) as CompletionPayload;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  try {
    const result = await completeWithRescore(payload);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "save_failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
