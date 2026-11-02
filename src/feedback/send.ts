import "server-only";
import { z } from "zod";
import { copyEn } from "@/copy/en";
import type { ContactFeedback } from "@/feedback/schema";

export class FeedbackAlreadySent extends Error {}

export function feedbackMailConfig() {
  const key = process.env.RESEND_API_KEY?.trim();
  const domain = process.env.RESEND_EMAIL_DOMAIN?.trim();
  const recipient = z.email().safeParse(process.env.FEEDBACK_TO_EMAIL?.trim());
  if (
    !key ||
    !domain ||
    !/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i.test(domain) ||
    !recipient.success
  )
    return null;
  return { key, from: `Who Am I <notifications@${domain}>`, to: recipient.data };
}

/** A fixed recipient and sender prevent the public form from acting as a mail relay. */
export async function sendContactFeedback(
  feedback: ContactFeedback,
  config: NonNullable<ReturnType<typeof feedbackMailConfig>>,
  dailyBucket: string,
) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `whoami-feedback/${dailyBucket}`,
    },
    body: JSON.stringify({
      from: config.from,
      to: [config.to],
      subject: copyEn.feedbackEmailSubject(copyEn.feedbackTopics[feedback.topic]),
      text: copyEn.feedbackEmailBody(
        copyEn.feedbackTopics[feedback.topic],
        feedback.comment,
        feedback.email,
      ),
      ...(feedback.email ? { reply_to: feedback.email } : {}),
    }),
    signal: AbortSignal.timeout(10_000),
  });
  const result = await response.json().catch(() => null);
  if (response.status === 409 && result?.name === "invalid_idempotent_request") {
    throw new FeedbackAlreadySent();
  }
  if (!response.ok || typeof result?.id !== "string" || !result.id) {
    console.error("feedback_delivery_failed", { status: response.status });
    throw new Error("feedback_delivery_failed");
  }
  return result.id as string;
}
