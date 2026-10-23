import { NextResponse } from "next/server";

/** Old stored records keep their existing Convex retention job. */
export function POST() {
  return NextResponse.json({ error: "saving_removed" }, { status: 410 });
}
