import { NextResponse } from "next/server";

// Retired endpoint: older clients cannot create new saved records.
export function POST() {
  return NextResponse.json({ error: "feedback_removed" }, { status: 410 });
}
