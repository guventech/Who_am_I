import { z } from "zod";

const MAX_BODY_BYTES = 32 * 1024;

export class RequestBodyError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

/** Bound bytes while reading, including chunked requests without Content-Length. */
export async function readStorageRequest<T>(
  request: Request,
  schema: z.ZodType<T>,
): Promise<T> {
  if (
    !request.headers.get("content-type")?.toLowerCase().startsWith("application/json")
  ) {
    throw new RequestBodyError("json_required", 415);
  }
  if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES) {
    throw new RequestBodyError("payload_too_large", 413);
  }
  const reader = request.body?.getReader();
  if (!reader) throw new RequestBodyError("invalid_json", 400);
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new RequestBodyError("payload_too_large", 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  let body: unknown;
  try {
    body = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new RequestBodyError("invalid_json", 400);
  }
  const result = schema.safeParse(body);
  if (!result.success) throw new RequestBodyError("invalid_payload", 400);
  return result.data;
}
