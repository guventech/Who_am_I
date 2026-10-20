"use client";

import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useSyncExternalStore } from "react";
import { LikertQuestion } from "@/components/LikertQuestion";
import { PrototypeBanner } from "@/components/PrototypeBanner";
import {
  getItemBank,
  getItemTextEn,
  getModelVersion,
} from "@/content/client-content";
import { copyEn } from "@/content/copy.en";
import type { ResponseValue } from "@/engine/types";
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
      if (n >= 1 && n <= 5) {
        e.preventDefault();
        handleAnswer(n as ResponseValue);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // handleAnswer reads live session via getSessionSnapshot()
  // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only keyboard binding
  }, []);

  function handleAnswer(value: ResponseValue) {
    const current = getSessionSnapshot();
    if (!current) return;
    const rtMs = Math.max(0, Math.round(performance.now() - shownAt.current));
    let next = answerCurrent(current, bank, model, value, rtMs);
    if (next.answered.length >= 10) {
      next = finishIfComplete(next, bank, model);
      saveSession(next);
      router.push("/result");
      return;
    }
    saveSession(next);
    shownAt.current = performance.now();
  }

  function handleBack() {
    const current = getSessionSnapshot();
    if (!current) return;
    saveSession(backOne(current));
    shownAt.current = performance.now();
  }

  if (!session) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[radial-gradient(ellipse_at_top,_#f4f7fb_0%,_#e8eef5_45%,_#d9e2ec_100%)]">
        <p className="text-slate-600">Loading…</p>
      </div>
    );
  }

  const itemId = currentItemId(session, bank, model);
  const questionText = itemId ? textEn[itemId] : null;

  if (!itemId || !questionText) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[radial-gradient(ellipse_at_top,_#f4f7fb_0%,_#e8eef5_45%,_#d9e2ec_100%)]">
        <p className="text-slate-600">Preparing result…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-[radial-gradient(ellipse_at_top,_#f4f7fb_0%,_#e8eef5_45%,_#d9e2ec_100%)]">
      <PrototypeBanner bankStatus={model.bankStatus} />
      <main className="mx-auto w-full max-w-lg flex-1 px-6 py-10">
        <LikertQuestion
          questionText={questionText}
          progressLabel={copyEn.progress(session.answered.length + 1, 10)}
          onAnswer={handleAnswer}
          onBack={handleBack}
          canBack={session.answered.length > 0}
        />
      </main>
    </div>
  );
}
