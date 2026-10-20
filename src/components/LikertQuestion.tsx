"use client";

import { copyEn } from "@/content/copy.en";
import type { ResponseValue } from "@/engine/types";

type Props = {
  questionText: string;
  progressLabel: string;
  onAnswer: (value: ResponseValue) => void;
  onBack: () => void;
  canBack: boolean;
};

export function LikertQuestion({
  questionText,
  progressLabel,
  onAnswer,
  onBack,
  canBack,
}: Props) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-slate-500">{progressLabel}</p>
        <button
          type="button"
          onClick={onBack}
          disabled={!canBack}
          className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-40 disabled:no-underline"
        >
          {copyEn.back}
        </button>
      </div>

      <h1 className="font-serif text-2xl leading-snug tracking-tight text-slate-900 sm:text-3xl">
        {questionText}
      </h1>

      <div
        role="group"
        aria-label={questionText}
        className="flex flex-col gap-2"
      >
        {copyEn.likert.map((label, index) => {
          const value = (index + 1) as ResponseValue;
          return (
            <button
              key={value}
              type="button"
              data-likert={value}
              onClick={() => onAnswer(value)}
              className="min-h-12 rounded-md border border-slate-300 bg-white/80 px-4 py-3 text-left text-base font-medium text-slate-900 transition hover:border-slate-500 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-800"
            >
              <span className="mr-3 inline-block w-5 text-sm text-slate-400 tabular-nums">
                {value}
              </span>
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
