import { contactFeedbackSchema } from "@/feedback/schema";
import {
  FeedbackAlreadySent,
  feedbackMailConfig,
  sendContactFeedback,
} from "@/feedback/send";
import { allowRoutedRequest, hmacBucketFromRequest } from "@/storage/rate-limit";
import { readStorageRequest, RequestBodyError } from "@/storage/read-request";

function reply(body: object, status = 200, headers?: Record<string, string>) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}

export async function POST(request: Request) {
  if (
    request.headers.get("origin") !== new URL(request.url).origin ||
    request.headers.get("sec-fetch-site") === "cross-site"
  ) {
    return reply({ error: "forbidden" }, 403);
  }
  const day = new Date().toISOString().slice(0, 10);
  const sentHeaders = {
    "Set-Cookie": `whoami-feedback-sent=${day}; Path=/; Max-Age=86400; HttpOnly; SameSite=Lax${new URL(request.url).protocol === "https:" ? "; Secure" : ""}`,
  };
  try {
    const feedback = await readStorageRequest(request, contactFeedbackSchema);
    if (feedback.website) return reply({ error: "invalid_payload" }, 400);
    if (
      request.headers
        .get("cookie")
        ?.split(";")
        .some((cookie) => cookie.trim() === `whoami-feedback-sent=${day}`)
    ) {
      return reply({ error: "feedback_already_sent" }, 409, sentHeaders);
    }
    const config = feedbackMailConfig();
    if (!config) return reply({ error: "feedback_unavailable" }, 503);
    // Best-effort, bounded per-runtime throttling. No feedback database is created.
    if (!allowRoutedRequest(request, "contact-feedback", 3, 1, 10 * 60_000)) {
      return reply({ error: "too_many_requests" }, 429, { "Retry-After": "600" });
    }
    // Provider-held deduplication survives separate Vercel instances and restarts.
    // The browser's submission UUID cannot create another daily allowance.
    await sendContactFeedback(feedback, config, hmacBucketFromRequest(request));
    return reply({ sent: true }, 200, sentHeaders);
  } catch (error) {
    if (error instanceof FeedbackAlreadySent)
      return reply({ error: "feedback_already_sent" }, 409, sentHeaders);
    if (error instanceof RequestBodyError)
      return reply({ error: error.message }, error.status);
    return reply({ error: "feedback_unavailable" }, 503);
  }
}
