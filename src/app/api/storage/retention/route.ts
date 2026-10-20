import { NextResponse } from "next/server";
import { runRetentionPurge } from "@/storage/server-store";

/** Dev/ops endpoint for the in-memory retention purge (Convex uses crons). */
export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "not_available" }, { status: 404 });
  }
  const removed = runRetentionPurge();
  return NextResponse.json({ removed });
}
