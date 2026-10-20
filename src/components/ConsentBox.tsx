"use client";

import { useSyncExternalStore } from "react";
import { copyEn } from "@/content/copy.en";
import {
  getConsentSnapshot,
  getServerConsentSnapshot,
  setConsent,
  subscribeConsent,
} from "@/session/consent-store";

export function ConsentBox() {
  const consent = useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    getServerConsentSnapshot,
  );

  return (
    <fieldset className="flex flex-col gap-3 rounded-md border border-slate-300/80 bg-white/50 px-4 py-3">
      <legend className="px-1 text-sm font-medium text-slate-700">
        {copyEn.consentLegend}
      </legend>
      <label className="flex items-start gap-3 text-sm leading-snug text-slate-700">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4"
          checked={consent.store}
          onChange={(e) => setConsent({ store: e.target.checked })}
          data-testid="consent-store"
        />
        <span>{copyEn.consentStore}</span>
      </label>
      {consent.store ? (
        <label className="flex items-start gap-3 text-sm leading-snug text-slate-700">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4"
            checked={consent.ageConfirmed}
            onChange={(e) => setConsent({ ageConfirmed: e.target.checked })}
            data-testid="consent-age"
          />
          <span>{copyEn.consentAge}</span>
        </label>
      ) : null}
      {consent.store && consent.ageConfirmed ? (
        <label className="flex items-start gap-3 text-sm leading-snug text-slate-700">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4"
            checked={consent.retakeLater}
            onChange={(e) => setConsent({ retakeLater: e.target.checked })}
            data-testid="consent-retake"
          />
          <span>{copyEn.consentRetake}</span>
        </label>
      ) : null}
      <p className="text-xs text-slate-500">{copyEn.consentDefault}</p>
    </fieldset>
  );
}
