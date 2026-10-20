"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { PrototypeBanner } from "@/components/PrototypeBanner";
import { getModelVersion } from "@/content/client-content";
import { copyEn } from "@/content/copy.en";
import { CORE_TRAIT_IDS, type TraitId } from "@/engine/types";
import {
  getConsentSnapshot,
  getServerConsentSnapshot,
  hasStorageConsent,
  subscribeConsent,
} from "@/session/consent-store";
import {
  getServerSessionSnapshot,
  getSessionSnapshot,
  subscribeSession,
} from "@/session/session-store";
import { createClientStorage } from "@/storage/client";
import type { TraitFeedback } from "@/storage/types";

const model = getModelVersion();

export function FeedbackClient() {
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
  const [overallFit, setOverallFit] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [traits, setTraits] = useState<Record<TraitId, TraitFeedback>>(() =>
    Object.fromEntries(
      CORE_TRAIT_IDS.map((id) => [
        id,
        { traitId: id, fit: 3 as const, off: "about_right" as const },
      ]),
    ) as Record<TraitId, TraitFeedback>,
  );
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">(
    "idle",
  );

  const consented = hasStorageConsent(consent);
  const canSubmit =
    consented && session?.storageSaved && session.sessionCode;

  return (
    <div className="flex flex-1 flex-col bg-[radial-gradient(ellipse_at_top,_#f4f7fb_0%,_#e8eef5_45%,_#d9e2ec_100%)]">
      <PrototypeBanner bankStatus={model.bankStatus} />
      <main className="mx-auto flex w-full max-w-lg flex-col gap-6 px-6 py-12">
        <Link
          href="/result"
          className="text-sm font-medium text-slate-600 underline-offset-4 hover:underline"
        >
          ← {copyEn.resultHeading}
        </Link>
        <h1 className="font-serif text-3xl text-slate-900">
          {copyEn.feedbackHeading}
        </h1>
        <p className="text-sm text-slate-600">{copyEn.feedbackIntro}</p>

        {!canSubmit ? (
          <p className="text-sm text-slate-700">
            {!consented
              ? copyEn.feedbackNeedConsent
              : copyEn.feedbackNeedCode}
          </p>
        ) : status === "done" ? (
          <p role="status">{copyEn.feedbackThanks}</p>
        ) : (
          <form
            className="flex flex-col gap-6"
            onSubmit={(e) => {
              e.preventDefault();
              if (!session?.sessionCode) return;
              setStatus("saving");
              const adapter = createClientStorage({
                consentStore: true,
                ageConfirmed: true,
              });
              void adapter
                .saveFeedback(session.sessionCode, {
                  overallFit,
                  traits: CORE_TRAIT_IDS.map((id) => traits[id]!),
                  insightThumbs: session.shownInsightIds.map((entryId) => ({
                    entryId,
                    up: true,
                  })),
                })
                .then(() => setStatus("done"))
                .catch(() => setStatus("error"));
            }}
          >
            <label className="flex flex-col gap-2 text-sm text-slate-800">
              {copyEn.feedbackOverall}
              <select
                className="h-10 rounded-md border border-slate-300 bg-white px-2"
                value={overallFit}
                onChange={(e) =>
                  setOverallFit(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)
                }
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>

            {CORE_TRAIT_IDS.map((id) => {
              const meta = model.traits.find((t) => t.id === id);
              const row = traits[id]!;
              return (
                <fieldset
                  key={id}
                  className="flex flex-col gap-2 border-t border-slate-200 pt-4"
                >
                  <legend className="font-medium text-slate-900">
                    {meta?.name ?? id}
                  </legend>
                  <label className="text-sm text-slate-700">
                    {copyEn.feedbackTraitFit}
                    <select
                      className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-2"
                      value={row.fit}
                      onChange={(e) =>
                        setTraits((prev) => ({
                          ...prev,
                          [id]: {
                            ...row,
                            fit: Number(e.target.value) as 1 | 2 | 3 | 4 | 5,
                          },
                        }))
                      }
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm text-slate-700">
                    {copyEn.feedbackTraitOff}
                    <select
                      className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-2"
                      value={row.off}
                      onChange={(e) =>
                        setTraits((prev) => ({
                          ...prev,
                          [id]: {
                            ...row,
                            off: e.target.value as TraitFeedback["off"],
                          },
                        }))
                      }
                    >
                      <option value="too_high">{copyEn.feedbackTooHigh}</option>
                      <option value="about_right">
                        {copyEn.feedbackAboutRight}
                      </option>
                      <option value="too_low">{copyEn.feedbackTooLow}</option>
                    </select>
                  </label>
                </fieldset>
              );
            })}

            <button
              type="submit"
              disabled={status === "saving"}
              className="inline-flex h-11 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white disabled:opacity-60"
            >
              {copyEn.feedbackSubmit}
            </button>
            {status === "error" ? (
              <p role="alert" className="text-sm text-slate-800">
                {copyEn.storageFailed}
              </p>
            ) : null}
          </form>
        )}
      </main>
    </div>
  );
}
