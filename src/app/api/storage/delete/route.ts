import { NextResponse } from "next/server";
import { isLegacyDeletionEnabled } from "@/config/storage-enabled";
import { jsonError } from "@/lib/api-errors";
import { allowRoutedRequest } from "@/storage/rate-limit";
import { deleteLegacyData } from "@/storage/delete-legacy";
import { deleteRequestSchema } from "@/storage/request-schema";
import { readStorageRequest, RequestBodyError } from "@/storage/read-request";

export async function POST(request: Request) {
  if (!isLegacyDeletionEnabled()) {
    return NextResponse.json({ error: "storage_unavailable" }, { status: 503 });
  }

  try {
    if (!allowRoutedRequest(request, "delete", 20, 8)) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }

    const body = await readStorageRequest(request, deleteRequestSchema);
    const result = await deleteLegacyData(body.sessionCode);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof RequestBodyError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : "delete_failed";
    return jsonError(message);
  }
}
