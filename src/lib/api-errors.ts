import { NextResponse } from "next/server";

/** Map storage/domain errors to HTTP status codes. */
export function jsonError(message: string, fallbackStatus = 400) {
  const status = message === "storage_unavailable" ? 503 : fallbackStatus;
  return NextResponse.json({ error: message }, { status });
}
