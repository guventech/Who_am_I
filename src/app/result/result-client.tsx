"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { PrototypeBanner } from "@/components/PrototypeBanner";
import { TraitSlider } from "@/components/TraitSlider";
import { getModelVersion } from "@/content/client-content";
import { copyEn } from "@/content/copy.en";
import { accuracySentenceFromClaims } from "@/lib/accuracy-copy";
import {
  getServerSessionSnapshot,
  getSessionSnapshot,
  subscribeSession,
} from "@/session/session-store";

const model = getModelVersion();

export function ResultClient() {
  const session = useSyncExternalStore(
    subscribeSession,
    getSessionSnapshot,
    getServerSessionSnapshot,
  );

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

  const accuracy = accuracySentenceFromClaims(model.config.ACCURACY_CLAIMS);
  const traitsById = new Map(model.traits.map((t) => [t.id, t]));

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
        </header>

        <section className="flex flex-col gap-8" aria-label={copyEn.yourSliders}>
          {session.scored.traits.map((score) => {
            const trait = traitsById.get(score.traitId);
            if (!trait) return null;
            return (
              <TraitSlider key={score.traitId} trait={trait} score={score} />
            );
          })}
        </section>

        <nav className="flex flex-col gap-3 border-t border-slate-300/70 pt-6">
          <Link
            href="/how-accurate"
            className="text-sm font-medium text-slate-800 underline-offset-4 hover:underline"
          >
            {copyEn.howAccurateLink}
          </Link>
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
