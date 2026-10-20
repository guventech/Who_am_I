"use client";

import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { PrototypeBanner } from "@/components/PrototypeBanner";
import { getModelVersion } from "@/content/client-content";
import { copyEn } from "@/copy/en";
import {
  getServerSessionSnapshot,
  getSessionSnapshot,
  subscribeSession,
} from "@/session/session-store";
import { setConsent } from "@/session/consent-store";

const model = getModelVersion();

type Props = {
  storageEnabled: boolean;
};

export function ConsentClient({ storageEnabled }: Props) {
  const router = useRouter();
  const session = useSyncExternalStore(
    subscribeSession,
    getSessionSnapshot,
    getServerSessionSnapshot,
  );
  const [age, setAge] = useState(false);

  if (!session?.completed || !session.scored) {
    return (
      <div className="flex flex-1 flex-col" style={{ background: "var(--bg)" }}>
        <PrototypeBanner bankStatus={model.bankStatus} />
        <main className="page flex flex-1 flex-col justify-center gap-4 py-12">
          <p style={{ color: "var(--ink)" }}>{copyEn.missingResult}</p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => router.push("/")}
          >
            {copyEn.takeAgain}
          </button>
        </main>
      </div>
    );
  }

  function goResultsWithoutSave() {
    setConsent({ store: false, ageConfirmed: false, retakeLater: false });
    router.push("/result");
  }

  function goResultsWithSave() {
    if (!age || !storageEnabled) return;
    setConsent({ store: true, ageConfirmed: true, retakeLater: false });
    router.push("/result");
  }

  return (
    <div className="flex flex-1 flex-col" style={{ background: "var(--bg)" }}>
      <PrototypeBanner bankStatus={model.bankStatus} />
      <main className="page flex flex-col gap-6 py-12">
        <h1 className="text-[32px]" style={{ color: "var(--ink)" }}>
          {copyEn.consentHeading}
        </h1>
        <p style={{ color: "var(--ink)" }}>{copyEn.consentBody}</p>
        {storageEnabled ? (
          <label className="flex items-start gap-3 text-[17px]">
            <input
              type="checkbox"
              checked={age}
              onChange={(e) => setAge(e.target.checked)}
              className="mt-1 h-5 w-5"
              data-testid="consent-age"
            />
            <span>{copyEn.consentAge}</span>
          </label>
        ) : null}
        <div className="flex flex-col gap-3 sm:flex-row">
          {storageEnabled ? (
            <button
              type="button"
              className="btn-primary"
              disabled={!age}
              data-testid="consent-yes"
              onClick={goResultsWithSave}
            >
              {copyEn.consentYes}
            </button>
          ) : null}
          <button
            type="button"
            className={storageEnabled ? "btn-secondary" : "btn-primary"}
            data-testid="consent-no"
            onClick={goResultsWithoutSave}
          >
            {copyEn.consentNo}
          </button>
        </div>
      </main>
    </div>
  );
}
