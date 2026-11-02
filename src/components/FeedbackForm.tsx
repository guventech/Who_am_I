"use client";

import { useEffect, useRef, useState } from "react";
import { copyEn } from "@/copy/en";
import { FEEDBACK_MAX_COMMENT, FEEDBACK_TOPICS } from "@/feedback/schema";

export function FeedbackForm({ onSent }: { onSent: () => void }) {
  const [status, setStatus] = useState<"editing" | "sending" | "error" | "sent">(
    "editing",
  );
  const [error, setError] = useState("");
  const inFlight = useRef(false);
  const submission = useRef<{ signature: string; id: string } | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const notice = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (status === "sent" || status === "error") notice.current?.focus();
  }, [status]);

  if (status === "sent")
    return (
      <div className="flex flex-col gap-4">
        <p ref={notice} tabIndex={-1} role="status">
          {copyEn.feedbackSent}
        </p>
      </div>
    );

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    inFlight.current = true;
    const data = new FormData(event.currentTarget);
    const fields = {
      topic: String(data.get("topic") ?? ""),
      comment: String(data.get("comment") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      website: String(data.get("website") ?? ""),
    };
    const signature = JSON.stringify(fields);
    if (submission.current?.signature !== signature) {
      submission.current = { signature, id: crypto.randomUUID() };
    }
    setStatus("sending");
    setError("");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15_000);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, submissionId: submission.current!.id }),
        signal: controller.signal,
      });
      const result = await response.json().catch(() => null);
      if (response.status === 409 && result?.error === "feedback_already_sent") {
        setStatus("sent");
        onSent();
        return;
      }
      if (!response.ok || result?.sent !== true) {
        setError(
          response.status === 429
            ? copyEn.feedbackRateLimited
            : [400, 413, 415].includes(response.status)
              ? copyEn.feedbackInvalid
              : copyEn.feedbackFailed,
        );
        setStatus("error");
        return;
      }
      form.current?.reset();
      setStatus("sent");
      onSent();
    } catch {
      setError(copyEn.feedbackFailed);
      setStatus("error");
    } finally {
      window.clearTimeout(timeout);
      inFlight.current = false;
    }
  }

  const fieldStyle = {
    borderColor: "var(--line)",
    background: "var(--card)",
    color: "var(--ink)",
  };
  return (
    <form
      ref={form}
      method="post"
      onSubmit={(event) => void submit(event)}
      className="flex flex-col gap-5"
    >
      <p id="feedback-privacy" className="text-[15px]" style={{ color: "var(--muted)" }}>
        {copyEn.feedbackPrivacy}
      </p>
      <fieldset disabled={status === "sending"} className="flex min-w-0 flex-col gap-5">
        <label className="flex flex-col gap-2 font-medium">
          {copyEn.feedbackTopicLabel}
          <select
            name="topic"
            required
            defaultValue=""
            className="min-h-12 rounded-[10px] border px-3 text-base font-normal"
            style={fieldStyle}
          >
            <option value="" disabled>
              {copyEn.feedbackTopicPlaceholder}
            </option>
            {FEEDBACK_TOPICS.map((topic) => (
              <option key={topic} value={topic}>
                {copyEn.feedbackTopics[topic]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 font-medium">
          {copyEn.feedbackCommentLabel}
          <textarea
            name="comment"
            required
            maxLength={FEEDBACK_MAX_COMMENT}
            rows={6}
            aria-describedby="feedback-comment-hint feedback-privacy"
            className="w-full rounded-[10px] border p-3 text-base font-normal"
            style={fieldStyle}
          />
        </label>
        <p
          id="feedback-comment-hint"
          className="-mt-3 text-sm"
          style={{ color: "var(--muted)" }}
        >
          {copyEn.feedbackCommentHint}
        </p>
        <label className="flex flex-col gap-2 font-medium">
          {copyEn.feedbackEmailLabel}
          <input
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            aria-describedby="feedback-email-hint"
            className="min-h-12 rounded-[10px] border px-3 text-base font-normal"
            style={fieldStyle}
          />
        </label>
        <p
          id="feedback-email-hint"
          className="-mt-3 text-sm"
          style={{ color: "var(--muted)" }}
        >
          {copyEn.feedbackEmailHint}
        </p>
        <div hidden aria-hidden="true">
          <label>
            {copyEn.feedbackWebsiteLabel}
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <button type="submit" className="btn-primary">
          {status === "sending" ? copyEn.feedbackSending : copyEn.feedbackSend}
        </button>
      </fieldset>
      {status === "error" ? (
        <p ref={notice} tabIndex={-1} role="alert">
          {error}
        </p>
      ) : null}
      <p role="status" className="text-sm">
        {status === "sending" ? copyEn.feedbackSending : null}
      </p>
    </form>
  );
}
