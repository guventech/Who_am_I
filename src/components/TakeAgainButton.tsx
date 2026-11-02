"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useId, useRef } from "react";
import { copyEn } from "@/copy/en";
import { beginFreshSession } from "@/session/session-store";
import { CopyInsightsButton } from "@/components/CopyInsightsButton";

type Props = {
  className?: string;
  text?: string;
  viewResults?: boolean;
};

/** Keep the current session intact until the user confirms replacement. */
export function TakeAgainButton({
  className = "btn-secondary",
  text,
  viewResults,
}: Props) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);
  const headingId = useId();
  const warningId = useId();

  return (
    <>
      <button
        type="button"
        className={className}
        data-testid="take-again"
        onClick={() => {
          dialog.current?.showModal();
          cancelButton.current?.focus();
        }}
      >
        {copyEn.takeAgain}
      </button>
      <dialog
        ref={dialog}
        aria-labelledby={headingId}
        aria-describedby={warningId}
        className="restart-dialog m-auto max-h-[90dvh] w-[calc(100%_-_40px)] max-w-lg overflow-y-auto rounded-xl border p-5"
        style={{
          background: "var(--card)",
          color: "var(--ink)",
          borderColor: "var(--line)",
        }}
      >
        <h2 id={headingId} className="text-xl font-semibold">
          {copyEn.restartHeading}
        </h2>
        <p id={warningId} className="mt-3">
          {copyEn.restartWarning}
        </p>
        {text || viewResults ? (
          <div className="mt-4">
            <p className="mb-3">{copyEn.restartExportHint}</p>
            {text ? (
              <CopyInsightsButton text={text} />
            ) : (
              <Link
                href="/result"
                className="btn-secondary"
                onClick={() => dialog.current?.close()}
              >
                {copyEn.viewResults}
              </Link>
            )}
          </div>
        ) : null}
        <form method="dialog" className="mt-5 flex flex-col gap-3">
          <button ref={cancelButton} className="btn-secondary">
            {copyEn.restartCancel}
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              dialog.current?.close();
              beginFreshSession();
              router.push("/test");
            }}
          >
            {copyEn.restartConfirm}
          </button>
        </form>
      </dialog>
    </>
  );
}
