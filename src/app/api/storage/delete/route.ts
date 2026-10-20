import { NextResponse } from "next/server";
import { allowRequest } from "@/storage/rate-limit";
import { deleteStored } from "@/storage/server-store";

export async function POST(request: Request) {
  const bucket = `delete:${new Date().toISOString().slice(0, 13)}`;
  if (!allowRequest(bucket, 30, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: { sessionCode?: string };
  try {
    body = (await request.json()) as { sessionCode?: string };
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body.sessionCode || typeof body.sessionCode !== "string") {
    return NextResponse.json({ error: "missing_code" }, { status: 400 });
  }

  try {
    const result = await deleteStored(body.sessionCode.trim());
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "delete_failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
