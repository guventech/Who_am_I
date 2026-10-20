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
import { copyEn } from "@/content/copy.en";
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
      <div className="flex flex-1 flex-col bg-[radial-gradient(ellipse_at_top,_#f4f7fb_0%,_#e8eef5_45%,_#d9e2ec_100%)]">
        <PrototypeBanner bankStatus={deeperModel.bankStatus} />
        <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-4 px-6 py-16">
          <p className="text-lg text-slate-700">{copyEn.goDeeperDisabled}</p>
          <Link
            href="/result"
            className="text-sm font-medium text-slate-800 underline-offset-4 hover:underline"
          >
            Back to result
          </Link>
        </main>
      </div>
    );
  }

  if (!session || !isDeeperSession(session)) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[radial-gradient(ellipse_at_top,_#f4f7fb_0%,_#e8eef5_45%,_#d9e2ec_100%)]">
        <main className="mx-auto flex max-w-lg flex-col gap-4 px-6 text-center">
          <p className="text-slate-700">{copyEn.missingResult}</p>
          <Link
            href="/"
            className="text-sm font-medium text-slate-800 underline-offset-4 hover:underline"
          >
            {copyEn.startAgain}
          </Link>
        </main>
      </div>
    );
  }

  const deeper = session as DeeperSession;
  const itemId = currentDeeperItemId(deeper, bank, deeperModel);
  const rawText = itemId ? textEn[itemId] : null;
  const questionText = rawText ? formatItemStem(rawText) : null;
  const asked = deeper.answered.length - deeper.deeperStartCount;
  const total = deeperModel.config.DEEPER_BUDGET_MAX;

  if (!itemId || !questionText) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[radial-gradient(ellipse_at_top,_#f4f7fb_0%,_#e8eef5_45%,_#d9e2ec_100%)]">
        <p className="text-slate-600">Preparing updated result…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-[radial-gradient(ellipse_at_top,_#f4f7fb_0%,_#e8eef5_45%,_#d9e2ec_100%)]">
      <PrototypeBanner bankStatus={deeperModel.bankStatus} />
      <main className="mx-auto w-full max-w-lg flex-1 px-6 py-10">
        <p className="mb-4 text-sm text-slate-600">{copyEn.goDeeperIntro}</p>
        <LikertQuestion
          questionText={questionText}
          progressLabel={copyEn.progress(asked + 1, total)}
          onAnswer={handleAnswer}
          onBack={handleBack}
          canBack={asked > 0}
        />
      </main>
    </div>
  );
}
