"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { PrototypeBanner } from "@/components/PrototypeBanner";
import { TakeAgainButton } from "@/components/TakeAgainButton";
import { getModelVersion } from "@/content/client-content";
import { copyEn } from "@/copy/en";
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
  const [fits, setFits] = useState<Partial<Record<TraitId, number>>>({});
  const [share, setShare] = useState<"" | "yes" | "maybe" | "no">("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">(
    "idle",
  );

  const consented = hasStorageConsent(consent);
  const canSubmit =
    consented &&
    session?.storageSaved &&
    session.sessionCode &&
    status !== "saving";

  return (
    <div className="flex flex-1 flex-col" style={{ background: "var(--bg)" }}>
      <PrototypeBanner bankStatus={model.bankStatus} />
      <main className="mx-auto flex w-full max-w-[720px] flex-col gap-6 px-5 py-12">
        <Link href="/result" className="text-[15px]" style={{ color: "var(--accent)" }}>
          {copyEn.feedbackBack}
        </Link>
        <h1 className="text-[32px]" style={{ color: "var(--ink)" }}>
          {copyEn.feedbackHeading}
        </h1>
        <p style={{ color: "var(--muted)" }}>{copyEn.feedbackIntro}</p>

        {!canSubmit && status !== "done" ? (
          <div className="flex flex-col gap-3">
            <p>{copyEn.feedbackNeedSaved}</p>
            <TakeAgainButton className="btn-primary" />
          </div>
        ) : status === "done" ? (
          <p role="status">{copyEn.feedbackThanks}</p>
        ) : (
          <form
            className="flex flex-col gap-6"
            onSubmit={(e) => {
              e.preventDefault();
              if (!session?.sessionCode) return;
              setStatus("saving");
              const traits = CORE_TRAIT_IDS.filter((id) => fits[id] != null).map(
                (id) => ({
                  traitId: id,
                  fit: (fits[id]! as 1 | 2 | 3 | 4 | 5),
                  off: "about_right" as const,
                }),
              );
              const adapter = createClientStorage({
                consentStore: true,
                ageConfirmed: true,
              });
              void adapter
                .saveFeedback(session.sessionCode, {
                  overallFit: (share === "yes"
                    ? 5
                    : share === "maybe"
                      ? 3
                      : 1) as 1 | 2 | 3 | 4 | 5,
                  traits,
                  insightThumbs: session.shownInsightIds.map((entryId) => ({
                    entryId,
                    up: true,
                  })),
                })
                .then(() => setStatus("done"))
                .catch(() => setStatus("error"));
            }}
          >
            {CORE_TRAIT_IDS.map((id) => {
              const meta = copyEn.traits[id];
              return (
                <fieldset
                  key={id}
                  className="flex flex-col gap-2 border-t pt-4"
                  style={{ borderColor: "var(--line)" }}
                >
                  <legend className="font-medium">
                    {meta.title} ({meta.science})
                  </legend>
                  <p className="text-sm" style={{ color: "var(--muted)" }}>
                    {copyEn.feedbackThisFits}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {copyEn.feedbackFitLabels.map((label, i) => {
                      // Map 4 labels onto fit 1-5 (schema); use 1,2,3,5
                      const fitVal = ([1, 2, 3, 5] as const)[i]!;
                      return (
                        <button
                          key={label}
                          type="button"
                          className="min-h-12 rounded-[10px] border-2 px-3 py-2 text-sm font-medium"
                          style={{
                            borderColor:
                              fits[id] === fitVal ? "var(--accent)" : "var(--line)",
                            background: fits[id] === fitVal ? "#eef2ff" : "#fff",
                          }}
                          onClick={() =>
                            setFits((prev) => ({ ...prev, [id]: fitVal }))
                          }
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              );
            })}

            <fieldset className="flex flex-col gap-2">
              <legend className="font-medium">{copyEn.feedbackShare}</legend>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["yes", copyEn.feedbackShareYes],
                    ["maybe", copyEn.feedbackShareMaybe],
                    ["no", copyEn.feedbackShareNo],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className="min-h-12 rounded-[10px] border-2 px-3 py-2 text-sm font-medium"
                    style={{
                      borderColor: share === key ? "var(--accent)" : "var(--line)",
                      background: share === key ? "#eef2ff" : "#fff",
                    }}
                    onClick={() => setShare(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>

            <button
              type="submit"
              className="btn-primary"
              disabled={!canSubmit || share === ""}
            >
              {copyEn.feedbackSubmit}
            </button>
            {status === "error" ? (
              <p role="alert">{copyEn.storageFailed}</p>
            ) : null}
          </form>
        )}
      </main>
    </div>
  );
}
