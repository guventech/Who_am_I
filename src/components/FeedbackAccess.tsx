"use client";

import Link from "next/link";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { FeedbackForm } from "@/components/FeedbackForm";
import { copyEn } from "@/copy/en";
import { canGiveFeedback, feedbackDay } from "@/feedback/eligibility";
import {
  getSessionSnapshot,
  getServerSessionSnapshot,
  saveSession,
  subscribeSession,
} from "@/session/session-store";

function useFeedbackSession() {
  return useSyncExternalStore(
    subscribeSession,
    getSessionSnapshot,
    getServerSessionSnapshot,
  );
}

export function FeedbackAccess() {
  const session = useFeedbackSession();
  const sent = !!session?.feedbackSentDay && session.feedbackSentDay === feedbackDay();
  const notice = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (sent) notice.current?.focus();
  }, [sent]);

  if (!canGiveFeedback(session))
    return (
      <div className="flex flex-col items-start gap-4">
        <p>{copyEn.feedbackNeedCompleted}</p>
        <Link href="/" className="btn-primary">
          {copyEn.feedbackReturn}
        </Link>
      </div>
    );
  if (sent)
    return (
      <p ref={notice} tabIndex={-1} role="status">
        {copyEn.feedbackSent}
      </p>
    );
  return (
    <FeedbackForm
      onSent={() => {
        const current = getSessionSnapshot();
        if (current) saveSession({ ...current, feedbackSentDay: feedbackDay() });
      }}
    />
  );
}
