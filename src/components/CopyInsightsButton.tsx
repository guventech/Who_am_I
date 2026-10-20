"use client";

import { useState } from "react";
import { copyEn } from "@/content/copy.en";

type Props = {
  text: string;
};

export function CopyInsightsButton({ text }: Props) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }}
      className="inline-flex h-11 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
    >
      {copied ? copyEn.copyInsightsDone : copyEn.copyInsights}
    </button>
  );
}
