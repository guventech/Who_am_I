"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { LikertQuestion } from "@/components/LikertQuestion";
import { PrototypeBanner } from "@/components/PrototypeBanner";
import {
  getItemBank,
  getItemTextEn,
  getModelVersion,
} from "@/content/client-content";
import { copyEn, itemHints } from "@/copy/en";
import type { ResponseValue } from "@/engine/types";
import { formatItemStem } from "@/lib/item-display";
import { setConsent } from "@/session/consent-store";
import {
  answerCurrent,
  backOne,
  currentItemId,
  finishIfComplete,
} from "@/session/run-session";
import {
  getServerSessionSnapshot,
  getSessionSnapshot,
  saveSession,
  subscribeSession,
} from "@/session/session-store";

const bank = getItemBank();
const model = getModelVersion();
const textEn = getItemTextEn();
const MIN_LOADING_MS = 300;

type Props = {
  storageEnabled: boolean;
};

function isResumableSession(
  session: NonNullable<ReturnType<typeof getSessionSnapshot>>,
): boolean {
  return (
    session.round === "core" &&
    !session.completed &&
    session.answered.length < 10
  );
}

export function TestClient({ storageEnabled }: Props) {
  const router = useRouter();
  const shownAt = useRef(performance.now());
  const [loadingLabel, setLoadingLabel] = useState<string | null>(null);
  const [restoredValue, setRestoredValue] = useState<ResponseValue | null>(
    null,
  );
  const longTimer = useRef<number | null>(null);

  const session = useSyncExternalStore(
    subscribeSession,
    getSessionSnapshot,
    getServerSessionSnapshot,
  );

  useEffect(() => {
    shownAt.current = performance.now();
  }, [session?.answered.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      const n = Number(e.key);
      if (n >= 1 && n <= 5 && !loadingLabel) {
        e.preventDefault();
        handleAnswer(n as ResponseValue);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only keyboard binding
  }, [loadingLabel]);

  function clearLongTimer() {
    if (longTimer.current != null) {
      window.clearTimeout(longTimer.current);
      longTimer.current = null;
    }
  }

  function handleAnswer(value: ResponseValue) {
    const current = getSessionSnapshot();
    if (!current || !isResumableSession(current) || loadingLabel) return;
    const rtMs = Math.max(0, Math.round(performance.now() - shownAt.current));
    setRestoredValue(null);

    const nextCount = current.answered.length + 1;
    setLoadingLabel(
      nextCount >= 10 ? copyEn.workingResults : copyEn.loading,
    );
    clearLongTimer();
    longTimer.current = window.setTimeout(() => {
      setLoadingLabel(copyEn.takingLonger);
    }, 8000);

    window.setTimeout(() => {
      let next = answerCurrent(current, bank, model, value, rtMs);
      if (next.answered.length >= 10) {
        next = finishIfComplete(next, bank, model);
        saveSession(next);
        clearLongTimer();
        if (storageEnabled) {
          router.push("/consent");
        } else {
          setConsent({ store: false, ageConfirmed: false, retakeLater: false });
          router.push("/result");
        }
        return;
      }
      saveSession(next);
      clearLongTimer();
      setLoadingLabel(null);
      shownAt.current = performance.now();
    }, MIN_LOADING_MS);
  }

  function handleBack() {
    if (loadingLabel) return;
    const current = getSessionSnapshot();
    if (!current || current.answered.length === 0) return;
    const last = current.answered[current.answered.length - 1]!;
    setRestoredValue(last.value);
    saveSession(backOne(current));
    shownAt.current = performance.now();
  }

  if (!session || !isResumableSession(session)) {
    return (
      <div className="flex flex-1 flex-col" style={{ background: "var(--bg)" }}>
        <PrototypeBanner bankStatus={model.bankStatus} />
        <main
          className="page flex flex-1 flex-col justify-center gap-4 py-12"
          data-testid="no-session"
        >
          <h1 className="text-[28px]" style={{ color: "var(--ink)" }}>
            {copyEn.noSessionHeading}
          </h1>
          <p style={{ color: "var(--ink)" }}>{copyEn.noSessionBody}</p>
          <Link href="/" className="btn-primary">
            {copyEn.noSessionCta}
          </Link>
        </main>
      </div>
    );
  }

  const itemId = currentItemId(session, bank, model);
  const rawText = itemId ? textEn[itemId] : null;
  const questionText = rawText ? formatItemStem(rawText) : null;
  const hint = itemId ? itemHints[itemId] : undefined;
  const selectedForCurrent = restoredValue;

  if (!itemId || !questionText) {
    return (
      <div className="flex flex-1 items-center justify-center" style={{ background: "var(--bg)" }}>
        <p
          role="status"
          aria-live="polite"
          className="loading-status"
          data-testid="loading-status"
        >
          <span className="loading-spinner" aria-hidden />
          {copyEn.workingResults}
        </p>
      </div>
    );
  }

  const n = session.answered.length + 1;

  return (
    <div className="flex w-full flex-1 flex-col" style={{ background: "var(--bg)" }}>
      <PrototypeBanner bankStatus={model.bankStatus} />
      <main data-testid="content-column" className="page flex-1 py-10">
        <LikertQuestion
          questionKey={itemId}
          questionText={questionText}
          hint={hint}
          progressLabel={copyEn.progress(n, 10)}
          progressPct={n * 10}
          showAnswerHint={n === 1}
          selectedValue={selectedForCurrent ?? null}
          loadingLabel={loadingLabel}
          onAnswer={handleAnswer}
          onBack={handleBack}
          canBack={session.answered.length > 0}
        />
      </main>
    </div>
  );
}
