"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { copyEn } from "@/copy/en";
import {
  beginFreshSession,
  getSessionSnapshot,
  getServerSessionSnapshot,
  subscribeSession,
} from "@/session/session-store";
import { TakeAgainButton } from "@/components/TakeAgainButton";
import { isDeeperSession } from "@/session/run-deeper";

export function StartButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const session = useSyncExternalStore(
    subscribeSession,
    getSessionSnapshot,
    getServerSessionSnapshot,
  );
  const hasResults = Boolean(session?.completed && session.scored);
  const pausedDeeper = Boolean(session && isDeeperSession(session) && !session.completed);
  const hasOriginalResults = Boolean(
    session &&
    isDeeperSession(session) &&
    (session.coreScored || session.coreAnswered?.length >= 10),
  );
  const existing = Boolean(
    session && (hasResults || session.answered.length > 0 || session.round === "deeper"),
  );

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        disabled={loading}
        onClick={() => {
          if (loading) return;
          setLoading(true);
          if (!existing) beginFreshSession();
          window.setTimeout(() => {
            router.push(
              hasResults ? "/result" : session?.round === "deeper" ? "/deeper" : "/test",
            );
          }, 300);
        }}
        className="btn-primary"
      >
        {hasResults
          ? copyEn.viewResults
          : existing
            ? session?.round === "deeper"
              ? copyEn.continueDeeper
              : copyEn.continueTest
            : copyEn.start}
      </button>
      {pausedDeeper && hasOriginalResults ? (
        <Link href="/result" className="btn-secondary">
          {copyEn.viewResults}
        </Link>
      ) : null}
      {existing ? (
        <TakeAgainButton viewResults={hasResults || hasOriginalResults} />
      ) : null}
      {loading ? (
        <p
          role="status"
          aria-live="polite"
          className="loading-status"
          data-testid="loading-status"
        >
          <span className="loading-spinner" aria-hidden />
          {copyEn.loading}
        </p>
      ) : null}
    </div>
  );
}
