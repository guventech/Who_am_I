"use client";

import { useId, useState } from "react";
import { copyEn } from "@/copy/en";

type Props = {
  text: string;
};

export function CopyInsightsButton({ text }: Props) {
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState(false);
  const textId = useId();

  async function copyResults() {
    setDone(false);
    try {
      await navigator.clipboard.writeText(text);
      setFailed(false);
      setDone(true);
    } catch {
      setFailed(true);
    }
  }

  return (
    <div className="flex w-full flex-col gap-3" data-testid="results-export">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button type="button" className="btn-primary" onClick={() => void copyResults()}>
          {copyEn.copyResults}
        </button>
        <a
          className="btn-secondary"
          href={`data:text/plain;charset=utf-8,${encodeURIComponent(text)}`}
          download={copyEn.resultsFilename}
        >
          {copyEn.downloadResults}
        </a>
      </div>
      <p role="status" className="text-sm">
        {done ? copyEn.copyResultsDone : failed ? copyEn.copyResultsFailed : null}
      </p>
      {failed ? (
        <div className="flex flex-col gap-2">
          <label htmlFor={textId}>{copyEn.resultsTextLabel}</label>
          <textarea
            id={textId}
            readOnly
            value={text}
            rows={10}
            className="w-full rounded-lg border p-3 text-sm"
            ref={(element) => {
              if (element) {
                element.focus();
                element.select();
              }
            }}
            onFocus={(event) => event.currentTarget.select()}
          />
        </div>
      ) : null}
    </div>
  );
}
