import { NextResponse } from "next/server";
import { isStorageEnabled } from "@/config/storage-enabled";
import { jsonError } from "@/lib/api-errors";
import { allowRoutedRequest } from "@/storage/rate-limit";
import { deleteStored } from "@/storage/server-store";

export async function POST(request: Request) {
  if (!isStorageEnabled()) {
    return NextResponse.json({ error: "storage_unavailable" }, { status: 503 });
  }

  if (!allowRoutedRequest(request, "delete", 20, 8)) {
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
    return jsonError(message);
  }
}
