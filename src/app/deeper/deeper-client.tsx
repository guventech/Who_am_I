"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useSyncExternalStore } from "react";
import { LikertQuestion } from "@/components/LikertQuestion";
import { PrototypeBanner } from "@/components/PrototypeBanner";
import { isGoDeeperAvailable } from "@/config/go-deeper";
import {
  getDeeperModelVersion,
  getItemBank,
  getItemTextEn,
} from "@/content/client-content";
import { copyEn, itemHints } from "@/copy/en";
import { formatItemStem } from "@/lib/item-display";
import type { ResponseValue } from "@/engine/types";
import {
  answerDeeper,
  backDeeperOne,
  beginDeeperSession,
  currentDeeperItemId,
  isDeeperSession,
  type DeeperSession,
} from "@/session/run-deeper";
import {
  getServerSessionSnapshot,
  getSessionSnapshot,
  saveSession,
  subscribeSession,
} from "@/session/session-store";

const bank = getItemBank();
const deeperModel = getDeeperModelVersion();
const textEn = getItemTextEn();
const available = isGoDeeperAvailable(bank, textEn);

export function DeeperClient() {
  const router = useRouter();
  const shownAt = useRef(0);

  const session = useSyncExternalStore(
    subscribeSession,
    getSessionSnapshot,
    getServerSessionSnapshot,
  );

  useLayoutEffect(() => {
    if (!available) return;
    const current = getSessionSnapshot();
    if (!current?.completed || !current.scored) return;
    if (isDeeperSession(current) && current.completed) {
      router.replace("/result");
      return;
    }
    if (isDeeperSession(current) && !current.completed) {
      shownAt.current = performance.now();
      return;
    }
    if (current.round === "core" && current.completed) {
      const deeper = beginDeeperSession(current, bank, deeperModel);
      saveSession(deeper);
      if (deeper.completed) {
        router.replace("/result");
        return;
      }
      shownAt.current = performance.now();
    }
  }, [router]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      const n = Number(e.key);
      if (n >= 1 && n <= 5) {
        e.preventDefault();
        handleAnswer(n as ResponseValue);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only keyboard binding
  }, []);

  function handleAnswer(value: ResponseValue) {
    const current = getSessionSnapshot();
    if (!current || !isDeeperSession(current) || current.completed) return;
    const rtMs = Math.max(0, Math.round(performance.now() - shownAt.current));
    const next = answerDeeper(current, bank, deeperModel, value, rtMs);
    saveSession(next);
    if (next.completed) {
      router.push("/result");
      return;
    }
    shownAt.current = performance.now();
  }

  function handleBack() {
    const current = getSessionSnapshot();
    if (!current || !isDeeperSession(current)) return;
    saveSession(backDeeperOne(current));
    shownAt.current = performance.now();
  }

  if (!available) {
    return (
      <div className="flex w-full flex-1 flex-col" style={{ background: "var(--bg)" }}>
        <PrototypeBanner bankStatus={deeperModel.bankStatus} />
        <main className="page flex flex-1 flex-col justify-center gap-4 py-12">
          <p style={{ color: "var(--ink)" }}>{copyEn.goDeeperDisabled}</p>
          <Link href="/result" className="btn-secondary">
            {copyEn.resultHeading}
          </Link>
        </main>
      </div>
    );
  }

  if (!session || !isDeeperSession(session)) {
    return (
      <div className="flex w-full flex-1 flex-col" style={{ background: "var(--bg)" }}>
        <PrototypeBanner bankStatus={deeperModel.bankStatus} />
        <main
          className="page flex flex-1 flex-col justify-center gap-4 py-12"
          data-testid="no-session"
        >
          <h1 className="text-[28px]" style={{ color: "var(--ink)" }}>
            {copyEn.noSessionHeading}
          </h1>
          <p style={{ color: "var(--ink)" }}>{copyEn.missingResult}</p>
          <Link href="/" className="btn-primary">
            {copyEn.noSessionCta}
          </Link>
        </main>
      </div>
    );
  }

  const deeper = session as DeeperSession;
  const itemId = currentDeeperItemId(deeper, bank, deeperModel);
  const rawText = itemId ? textEn[itemId] : null;
  const questionText = rawText ? formatItemStem(rawText) : null;
  const hint = itemId ? itemHints[itemId] : undefined;
  const asked = deeper.answered.length - deeper.deeperStartCount;
  const total = deeperModel.config.DEEPER_BUDGET_MAX;

  if (!itemId || !questionText) {
    return (
      <div
        className="flex flex-1 items-center justify-center"
        style={{ background: "var(--bg)" }}
      >
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

  return (
    <div className="flex w-full flex-1 flex-col" style={{ background: "var(--bg)" }}>
      <PrototypeBanner bankStatus={deeperModel.bankStatus} />
      <main data-testid="content-column" className="page flex-1 py-10">
        <p className="mb-6 text-[15px]" style={{ color: "var(--muted)" }}>
          {copyEn.goDeeperIntro}
        </p>
        <LikertQuestion
          questionKey={itemId}
          questionText={questionText}
          hint={hint}
          progressLabel={copyEn.progress(asked + 1, total)}
          progressPct={((asked + 1) / total) * 100}
          showAnswerHint={asked === 0}
          onAnswer={handleAnswer}
          onBack={handleBack}
          canBack={asked > 0}
        />
      </main>
    </div>
  );
}
