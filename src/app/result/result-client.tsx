"use client";

import Link from "next/link";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { CopyInsightsButton } from "@/components/CopyInsightsButton";
import { InsightBlocks } from "@/components/InsightBlocks";
import { PrototypeBanner } from "@/components/PrototypeBanner";
import { TraitSlider } from "@/components/TraitSlider";
import { ENABLE_LLM_REWORD } from "@/config/flags";
import { getModelVersion } from "@/content/client-content";
import { copyEn } from "@/content/copy.en";
import { getInsightLibrary } from "@/insights/client-library";
import { formatInsightsAsText } from "@/insights/format-copy";
import { selectInsights } from "@/insights/select";
import { accuracySentenceFromClaims } from "@/lib/accuracy-copy";
import { coarseDeviceClass } from "@/lib/device-class";
import {
  getConsentSnapshot,
  getServerConsentSnapshot,
  hasStorageConsent,
  subscribeConsent,
} from "@/session/consent-store";
import {
  getServerSessionSnapshot,
  getSessionSnapshot,
  saveSession,
  subscribeSession,
} from "@/session/session-store";
import { createClientStorage } from "@/storage/client";

const model = getModelVersion();
const insightLibrary = getInsightLibrary();

export function ResultClient() {
  const session = useSyncExternalStore(
    subscribeSession,
    getSessionSnapshot,
    getServerSessionSnapshot,
  );
  const consent = useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    getServerConsentSnapshot,
  );
  const saveStarted = useRef(false);

  useEffect(() => {
    const current = getSessionSnapshot();
    if (!current?.completed || !current.scored) return;
    if (current.storageSaved || current.storageError) return;
    if (saveStarted.current) return;

    const insights = selectInsights(current.scored.traits, insightLibrary);
    const c = getConsentSnapshot();

    if (!hasStorageConsent(c)) {
      saveStarted.current = true;
      saveSession({
        ...current,
        shownInsightIds: insights.shownEntryIds,
      });
      return;
    }

    saveStarted.current = true;
    const adapter = createClientStorage({
      consentStore: c.store,
      ageConfirmed: c.ageConfirmed,
    });

    void (async () => {
      try {
        const { sessionCode } = await adapter.saveCompletion({
          modelVersionId: model.id,
          responses: current.answered,
          clientScores: current.scored!.traits.map((t) => ({
            traitId: t.traitId,
            slider: t.slider,
            theta: t.theta,
          })),
          flags: current.scored!.flags,
          shownInsightIds: insights.shownEntryIds,
          deviceClass: coarseDeviceClass(),
          startDay: current.startDay,
          locale: "en",
          retakeLater: c.retakeLater,
        });
        saveSession({
          ...current,
          shownInsightIds: insights.shownEntryIds,
          sessionCode,
          storageSaved: true,
          storageError: null,
        });
      } catch (err) {
        saveSession({
          ...current,
          shownInsightIds: insights.shownEntryIds,
          storageSaved: false,
          storageError: err instanceof Error ? err.message : "save_failed",
        });
      }
    })();
  }, [session?.completed, consent.store, consent.ageConfirmed]);

  if (!session?.completed || !session.scored) {
    return (
      <div className="flex flex-1 flex-col bg-[radial-gradient(ellipse_at_top,_#f4f7fb_0%,_#e8eef5_45%,_#d9e2ec_100%)]">
        <PrototypeBanner bankStatus={model.bankStatus} />
        <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-4 px-6 py-16">
          <p className="text-lg text-slate-700">{copyEn.missingResult}</p>
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

  const insights = selectInsights(session.scored.traits, insightLibrary);
  const accuracy = accuracySentenceFromClaims(model.config.ACCURACY_CLAIMS);
  const traitsById = new Map(model.traits.map((t) => [t.id, t]));
  const copyText = formatInsightsAsText(insights);
  const consented = hasStorageConsent(consent);

  return (
    <div className="flex flex-1 flex-col bg-[radial-gradient(ellipse_at_top,_#f4f7fb_0%,_#e8eef5_45%,_#d9e2ec_100%)]">
      <PrototypeBanner bankStatus={model.bankStatus} />
      <main className="mx-auto flex w-full max-w-lg flex-col gap-8 px-6 py-12">
        <header className="flex flex-col gap-3">
          <p className="text-sm font-medium tracking-[0.2em] text-slate-500 uppercase">
            {copyEn.brand}
          </p>
          <h1 className="font-serif text-3xl tracking-tight text-slate-900">
            {copyEn.resultHeading}
          </h1>
          <p className="text-sm leading-relaxed text-slate-600">
            {copyEn.disclaimer}
          </p>
          <p className="text-sm text-slate-600">{copyEn.positionWording}</p>
          {session.scored.flags.any ? (
            <p role="status" className="text-sm text-slate-700">
              {copyEn.flagNote}
            </p>
          ) : null}
          {accuracy ? (
            <p className="text-sm text-slate-700">{accuracy}</p>
          ) : null}
          {consented && !session.storageSaved && !session.storageError ? (
            <p className="text-sm text-slate-600">{copyEn.storageSaving}</p>
          ) : null}
          {session.storageSaved && session.sessionCode ? (
            <div
              className="rounded-md border border-slate-300 bg-white/70 px-3 py-2 text-sm text-slate-800"
              data-testid="session-code"
            >
              <p className="font-medium">{copyEn.sessionCodeStored}</p>
              <p className="mt-1 font-mono text-base tracking-wider">
                {session.sessionCode}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {copyEn.sessionCodeLabel}
              </p>
            </div>
          ) : null}
          {session.storageError ? (
            <p role="alert" className="text-sm text-slate-800">
              {copyEn.storageFailed}
            </p>
          ) : null}
          {!consented ? (
            <p className="text-sm text-slate-600">{copyEn.storageSkipped}</p>
          ) : null}
        </header>

        <section className="flex flex-col gap-8" aria-label={copyEn.yourSliders}>
          {session.scored.traits.map((score) => {
            const trait = traitsById.get(score.traitId);
            if (!trait) return null;
            return (
              <TraitSlider
                key={score.traitId}
                trait={trait}
                score={score}
                tradeOff={insights.tradeOffsByTrait[score.traitId]}
              />
            );
          })}
        </section>

        <InsightBlocks insights={insights} />

        <nav className="flex flex-col gap-3 border-t border-slate-300/70 pt-6">
          <CopyInsightsButton text={copyText} />
          {ENABLE_LLM_REWORD ? (
            <button type="button" disabled className="text-sm text-slate-500">
              {copyEn.llmRewordStub}
            </button>
          ) : null}
          {consented && session.storageSaved ? (
            <Link
              href="/feedback"
              className="text-sm font-medium text-slate-800 underline-offset-4 hover:underline"
            >
              {copyEn.feedbackLink}
            </Link>
          ) : null}
          <Link
            href="/how-accurate"
            className="text-sm font-medium text-slate-800 underline-offset-4 hover:underline"
          >
            {copyEn.howAccurateLink}
          </Link>
          <Link
            href="/privacy"
            className="text-sm font-medium text-slate-800 underline-offset-4 hover:underline"
          >
            {copyEn.privacyLink}
          </Link>
          {session.storageSaved ? (
            <Link
              href="/privacy#delete"
              className="text-sm font-medium text-slate-800 underline-offset-4 hover:underline"
            >
              {copyEn.deleteData}
            </Link>
          ) : null}
          <p className="text-sm text-slate-500">{copyEn.goDeeperSoon}</p>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-md border border-slate-400 bg-white/70 px-4 text-sm font-medium text-slate-900 hover:bg-white"
          >
            {copyEn.startAgain}
          </Link>
        </nav>
      </main>
    </div>
  );
}
