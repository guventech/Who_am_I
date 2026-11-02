"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { copyEn } from "@/copy/en";
import { canGiveFeedback } from "@/feedback/eligibility";
import {
  getSessionSnapshot,
  getServerSessionSnapshot,
  subscribeSession,
} from "@/session/session-store";

export function FeedbackLink({ className }: { className?: string }) {
  const session = useSyncExternalStore(
    subscribeSession,
    getSessionSnapshot,
    getServerSessionSnapshot,
  );
  if (!canGiveFeedback(session)) return null;
  return (
    <Link href="/feedback" className={className}>
      {copyEn.feedbackSend}
    </Link>
  );
}
