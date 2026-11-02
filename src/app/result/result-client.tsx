"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ColourSummary } from "@/components/ColourSummary";
import { CopyInsightsButton } from "@/components/CopyInsightsButton";
import { LessCertainMark } from "@/components/LessCertainMark";
import { PrototypeBanner } from "@/components/PrototypeBanner";
import { TakeAgainButton } from "@/components/TakeAgainButton";
import { TraitCard } from "@/components/TraitCard";
import { isGoDeeperAvailable } from "@/config/go-deeper";
import { ENABLE_COLOURS } from "@/config/flags";
import { getItemBank, getItemTextEn, getModelVersion } from "@/content/client-content";
import { copyEn } from "@/copy/en";
import { CORE_TRAIT_IDS, type TraitId, type TraitScore } from "@/engine/types";
import { selectInsightsV1 } from "@/insights/select-v1";
import { resultsText } from "@/lib/results-text";
import {
  getServerSessionSnapshot,
  getSessionSnapshot,
  subscribeSession,
} from "@/session/session-store";

const coreModel = getModelVersion();
const bank = getItemBank();
const textEn = getItemTextEn();
const goDeeperAvailable = isGoDeeperAvailable(bank, textEn);

function displayTraits(traits: TraitScore[]): TraitScore[] {
  const core = traits.filter((t) =>
    (CORE_TRAIT_IDS as readonly string[]).includes(t.traitId),
  );
  const h = traits.find((t) => t.traitId === "H");
  return h ? [...core, h] : core;
}

export function ResultClient({ allowDrafts }: { allowDrafts: boolean }) {
  const session = useSyncExternalStore(
    subscribeSession,
    getSessionSnapshot,
    getServerSessionSnapshot,
  );
  const missing = !session?.completed || !session.scored;

  return (
    <div className="flex w-full flex-1 flex-col" style={{ background: "var(--bg)" }}>
      <PrototypeBanner bankStatus={coreModel.bankStatus} />
      <main data-testid="content-column" className="page flex-1 py-8 pb-16">
        {missing ? (
          <div className="flex flex-col gap-4 py-16" data-testid="no-session">
            <h1 className="text-[28px]" style={{ color: "var(--ink)" }}>
              {copyEn.noSessionHeading}
            </h1>
            <p style={{ color: "var(--ink)" }}>{copyEn.missingResult}</p>
            <Link href="/" className="btn-primary">
              {copyEn.noSessionCta}
            </Link>
          </div>
        ) : (
          <ResultBody session={session!} allowDrafts={allowDrafts} />
        )}
      </main>
    </div>
  );
}

function ResultBody({
  session,
  allowDrafts,
}: {
  session: NonNullable<ReturnType<typeof getSessionSnapshot>>;
  allowDrafts: boolean;
}) {
  const scored = session.scored!;
  const shownTraits = displayTraits(scored.traits);
  const hasH = shownTraits.some((t) => t.traitId === "H");
  const insights = selectInsightsV1(shownTraits, { allowDrafts });

  const copyText = resultsText(shownTraits, { allowDrafts });
  const showGoDeeper = goDeeperAvailable && !hasH;

  return (
    <>
      <h1 className="text-[32px] leading-tight" style={{ color: "var(--ink)" }}>
        {copyEn.resultHeading}
      </h1>
      <p className="mt-2" style={{ color: "var(--muted)" }}>
        {copyEn.resultLead}
      </p>
      <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
        {copyEn.resultsLocalOnly}
      </p>
      {scored.flags.any ? (
        <p role="status" className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
          {copyEn.flagNote}
        </p>
      ) : null}

      <section className="mt-6" aria-labelledby="keep-results-heading">
        <h2 id="keep-results-heading" className="text-lg font-semibold">
          {copyEn.keepResultsHeading}
        </h2>
        <p className="mt-2 mb-3 text-[15px]" style={{ color: "var(--muted)" }}>
          {copyEn.keepResultsHint}
        </p>
        <CopyInsightsButton text={copyText} />
      </section>

      <h2 className="mt-10 text-[22px]" style={{ color: "var(--ink)" }}>
        {hasH ? copyEn.yourSixTraits : copyEn.yourFiveTraits}
      </h2>
      <p className="mt-2 text-[15px]" style={{ color: "var(--muted)" }}>
        {copyEn.scoresNote}
      </p>
      {hasH ? (
        <p className="mt-2 text-[15px]" style={{ color: "var(--muted)" }}>
          {copyEn.rangesAfterDeeper}
        </p>
      ) : null}
      <div
        className="mt-3 flex flex-wrap items-center gap-4 text-sm"
        style={{ color: "var(--muted)" }}
      >
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-[22px] rounded"
            style={{ background: "var(--band)" }}
          />
          {copyEn.retakeLegend}
        </span>
        <span>{copyEn.middleLegend}</span>
      </div>

      <div className="mt-3 flex flex-col gap-3">
        {shownTraits.map((score) => (
          <TraitCard
            key={score.traitId}
            traitId={score.traitId as TraitId}
            score={score}
          />
        ))}
      </div>

      {ENABLE_COLOURS ? <ColourSummary traits={shownTraits} /> : null}

      {insights.strengths.length > 0 ? (
        <>
          <h2 className="mt-10 text-[22px]" style={{ color: "var(--ink)" }}>
            {copyEn.whatThisMeans}
          </h2>
          <p className="mt-2 text-[15px]" style={{ color: "var(--muted)" }}>
            {copyEn.notForJudgingOthers}
          </p>
          <p className="mt-2 text-[15px]" style={{ color: "var(--muted)" }}>
            {copyEn.insightsNote}
          </p>

          <h3 className="mt-5 text-lg font-semibold">{copyEn.yourStrengths}</h3>
          <div className="mt-2 flex flex-col gap-3">
            {insights.strengths.map((s) => (
              <div
                key={s.entryId + s.strength}
                className="rounded-xl border p-5"
                style={{ background: "var(--card)", borderColor: "var(--line)" }}
              >
                <h3 className="text-lg font-semibold" style={{ color: "var(--accent)" }}>
                  {s.strength}
                  {s.soft ? <LessCertainMark /> : null}
                </h3>
                <dl className="mt-2">
                  <dt
                    className="mt-2 text-[13px] font-bold uppercase tracking-wide"
                    style={{ color: "var(--muted)" }}
                  >
                    {copyEn.interviewLabel}
                  </dt>
                  <dd className="mt-1">{s.interview}</dd>
                  <dt
                    className="mt-2 text-[13px] font-bold uppercase tracking-wide"
                    style={{ color: "var(--muted)" }}
                  >
                    {copyEn.cvLabel}
                  </dt>
                  <dd className="mt-1">{s.cv}</dd>
                </dl>
              </div>
            ))}
          </div>

          {insights.watchOuts.length > 0 ? (
            <>
              <h3 className="mt-7 text-lg font-semibold">{copyEn.watchOutFor}</h3>
              <div className="mt-2 flex flex-col gap-3">
                {insights.watchOuts.map((w) => (
                  <div
                    key={w.entryId + w.watchOut}
                    className="rounded-xl border p-5"
                    style={{ background: "var(--card)", borderColor: "var(--line)" }}
                  >
                    <h3
                      className="text-lg font-semibold"
                      style={{ color: "var(--warn)" }}
                    >
                      {w.watchOut}
                      {w.soft ? <LessCertainMark /> : null}
                    </h3>
                    <p className="mt-3 font-semibold">{copyEn.tryThis}</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      {w.tips.map((tip) => (
                        <li key={tip}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </>
      ) : null}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {showGoDeeper ? (
          <Link href="/deeper" className="btn-primary" data-testid="go-deeper">
            {copyEn.goDeeperCta}
          </Link>
        ) : null}
        <TakeAgainButton text={copyText} />
      </div>
      {showGoDeeper ? (
        <p className="mt-2 text-[15px]" style={{ color: "var(--muted)" }}>
          {copyEn.goDeeperHint}
        </p>
      ) : null}

      <footer className="mt-7 flex flex-wrap gap-4 text-[15px]">
        <Link href="/how-accurate" style={{ color: "var(--accent)" }}>
          {copyEn.howAccurateLink}
        </Link>
        <Link href="/privacy" style={{ color: "var(--accent)" }}>
          {copyEn.privacyLink}
        </Link>
      </footer>
    </>
  );
}
