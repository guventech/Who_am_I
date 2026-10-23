import "server-only";
import { ConvexHttpClient } from "convex/browser";
import { hashSessionCode } from "./session-code";

/** Existing users can delete old records; this module cannot create records. */
export async function deleteLegacyData(sessionCode: string) {
  const client = new ConvexHttpClient(process.env.CONVEX_URL!);
  return client.mutation(
    "sessions:deleteByCode" as never,
    {
      serverKey: process.env.CONVEX_SERVER_KEY!,
      codeHash: await hashSessionCode(sessionCode),
    } as never,
  );
}
