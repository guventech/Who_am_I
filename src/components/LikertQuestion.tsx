"use client";

import { useState } from "react";
import { copyEn } from "@/copy/en";
import type { ResponseValue } from "@/engine/types";

type Props = {
  questionText: string;
  questionKey?: string;
  hint?: string;
  progressLabel: string;
  progressPct: number;
  showAnswerHint?: boolean;
  selectedValue?: ResponseValue | null;
  loadingLabel?: string | null;
  onAnswer: (value: ResponseValue) => void;
  onBack: () => void;
  canBack: boolean;
};

export function LikertQuestion({
  questionText,
  questionKey,
  hint,
  progressLabel,
  progressPct,
  showAnswerHint,
  selectedValue,
  loadingLabel,
  onAnswer,
  onBack,
  canBack,
}: Props) {
  return (
    <LikertQuestionInner
      key={questionKey ?? questionText}
      questionText={questionText}
      hint={hint}
      progressLabel={progressLabel}
      progressPct={progressPct}
      showAnswerHint={showAnswerHint}
      selectedValue={selectedValue}
      loadingLabel={loadingLabel}
      onAnswer={onAnswer}
      onBack={onBack}
      canBack={canBack}
    />
  );
}

function LikertQuestionInner({
  questionText,
  hint,
  progressLabel,
  progressPct,
  showAnswerHint,
  selectedValue,
  loadingLabel,
  onAnswer,
  onBack,
  canBack,
}: Omit<Props, "questionKey">) {
  const [pending, setPending] = useState<ResponseValue | null>(null);
  const disabled = Boolean(loadingLabel) || pending !== null;

  function choose(value: ResponseValue) {
    if (disabled) return;
    setPending(value);
    onAnswer(value);
  }

  const shownSelected = pending ?? selectedValue ?? null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>
          {progressLabel}
        </p>
        <button
          type="button"
          onClick={onBack}
          disabled={!canBack || disabled}
          className="text-sm font-medium underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-40 disabled:no-underline"
          style={{ color: "var(--ink)" }}
        >
          {copyEn.back}
        </button>
      </div>

      <div
        className="h-2 w-full overflow-hidden rounded-full"
        style={{ background: "var(--track)" }}
        aria-hidden
      >
        <div
          className="h-full rounded-full transition-[width] duration-300 ease-out"
          style={{
            width: `${Math.min(100, Math.max(0, progressPct))}%`,
            background: "var(--accent)",
          }}
        />
      </div>

      <h1
        className="text-2xl leading-snug tracking-tight sm:text-[28px]"
        style={{ color: "var(--ink)" }}
      >
        {questionText}
      </h1>
      {hint ? (
        <p className="-mt-3 text-sm" style={{ color: "var(--muted)" }}>
          {hint}
        </p>
      ) : null}
      {showAnswerHint ? (
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          {copyEn.answerHint}
        </p>
      ) : null}

      {loadingLabel ? (
        <p
          role="status"
          aria-live="polite"
          className="loading-status"
          data-testid="loading-status"
        >
          <span className="loading-spinner" aria-hidden />
          {loadingLabel}
        </p>
      ) : null}

      <div
        role="group"
        aria-label={questionText}
        className="flex flex-col gap-2"
      >
        {copyEn.likert.map((label, index) => {
          const value = (index + 1) as ResponseValue;
          const selected = shownSelected === value;
          return (
            <button
              key={value}
              type="button"
              data-likert={value}
              data-selected={selected ? "true" : undefined}
              disabled={disabled}
              onClick={() => choose(value)}
              className="min-h-12 rounded-[10px] border-2 px-4 py-3 text-left text-base font-medium transition"
              style={{
                borderColor: selected ? "var(--accent)" : "var(--line)",
                background: selected ? "#eef2ff" : "#fff",
                color: "var(--ink)",
                opacity: disabled && !selected ? 0.6 : 1,
              }}
            >
              <span className="flex items-center justify-between gap-3">
                <span>{label}</span>
                {selected ? (
                  <span
                    aria-hidden
                    data-testid="likert-check"
                    style={{ color: "var(--accent)", opacity: 1 }}
                  >
                    ✓
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
