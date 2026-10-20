"use client";

import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
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
import {
  answerCurrent,
  backOne,
  currentItemId,
  finishIfComplete,
} from "@/session/run-session";
import {
  ensureActiveSession,
  getServerSessionSnapshot,
  getSessionSnapshot,
  saveSession,
  subscribeSession,
} from "@/session/session-store";

const bank = getItemBank();
const model = getModelVersion();
const textEn = getItemTextEn();

export function TestClient() {
  const router = useRouter();
  const shownAt = useRef(0);
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

  useLayoutEffect(() => {
    ensureActiveSession();
    shownAt.current = performance.now();
  }, []);

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
    if (!current || loadingLabel) return;
    const rtMs = Math.max(0, Math.round(performance.now() - shownAt.current));
    setRestoredValue(null);

    const nextCount = current.answered.length + 1;
    setLoadingLabel(
      nextCount >= 10 ? copyEn.workingResults : copyEn.loadingNext,
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
        router.push("/consent");
        return;
      }
      saveSession(next);
      clearLongTimer();
      setLoadingLabel(null);
      shownAt.current = performance.now();
    }, 100);
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

  if (!session) {
    return (
      <div className="flex flex-1 items-center justify-center" style={{ background: "var(--bg)" }}>
        <p style={{ color: "var(--muted)" }}>{copyEn.loadingNext}</p>
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
        <p style={{ color: "var(--muted)" }}>{copyEn.workingResults}</p>
      </div>
    );
  }

  const n = session.answered.length + 1;

  return (
    <div className="flex flex-1 flex-col" style={{ background: "var(--bg)" }}>
      <PrototypeBanner bankStatus={model.bankStatus} />
      <main className="mx-auto w-full max-w-[720px] flex-1 px-5 py-10">
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
