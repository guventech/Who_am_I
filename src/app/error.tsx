"use client";

import { useEffect } from "react";
import { TakeAgainButton } from "@/components/TakeAgainButton";
import { copyEn } from "@/copy/en";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col" style={{ background: "var(--bg)" }}>
      <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col justify-center gap-4 px-5 py-16">
        <h1 className="text-[32px]" style={{ color: "var(--ink)" }}>
          {copyEn.errorHeading}
        </h1>
        <p>{copyEn.errorBody}</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={reset} className="btn-primary">
            {copyEn.errorRetry}
          </button>
          <TakeAgainButton />
        </div>
      </main>
    </div>
  );
}
