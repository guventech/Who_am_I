import { describe, expect, it } from "vitest";
import { completionPayloadSchema, deleteRequestSchema } from "@/storage/request-schema";
import { readStorageRequest } from "@/storage/read-request";

function request(body: string, headers = {}) {
  return new Request("http://localhost/api/storage/complete", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body,
  });
}

describe("bounded storage input", () => {
  it.each([null, [], 42, "text", {}, { consentStore: true, ageConfirmed: true }])(
    "rejects malformed JSON shapes without throwing property access errors: %j",
    async (body) => {
      await expect(
        readStorageRequest(request(JSON.stringify(body)), completionPayloadSchema),
      ).rejects.toMatchObject({ message: "invalid_payload", status: 400 });
    },
  );

  it("rejects oversized streamed bodies even without Content-Length", async () => {
    await expect(
      readStorageRequest(
        request(JSON.stringify("a".repeat(33 * 1024))),
        completionPayloadSchema,
      ),
    ).rejects.toMatchObject({ message: "payload_too_large", status: 413 });
  });

  it("rejects non-JSON and invalid JSON", async () => {
    await expect(
      readStorageRequest(
        request("{}", { "content-type": "text/plain" }),
        completionPayloadSchema,
      ),
    ).rejects.toMatchObject({ status: 415 });
    await expect(
      readStorageRequest(request("{"), completionPayloadSchema),
    ).rejects.toMatchObject({ message: "invalid_json", status: 400 });
  });

  it("normalizes both existing 10-character codes and retry recovery codes", async () => {
    expect(
      await readStorageRequest(
        request('{"sessionCode":" abcdefgh23 "}'),
        deleteRequestSchema,
      ),
    ).toEqual({ sessionCode: "ABCDEFGH23" });
    expect(
      deleteRequestSchema.safeParse({ sessionCode: "ABCDEFGH23456789" }).success,
    ).toBe(true);
  });
});
