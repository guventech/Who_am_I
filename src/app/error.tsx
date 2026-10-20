"use client";

import Link from "next/link";
import { useEffect } from "react";
import { copyEn } from "@/content/copy.en";

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
    <div className="flex flex-1 flex-col bg-[radial-gradient(ellipse_at_top,_#f4f7fb_0%,_#e8eef5_45%,_#d9e2ec_100%)]">
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-4 px-6 py-16">
        <h1 className="font-serif text-2xl text-slate-900">
          {copyEn.errorHeading}
        </h1>
        <p className="text-base text-slate-700">{copyEn.errorBody}</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800"
          >
            {copyEn.errorRetry}
          </button>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-md border border-slate-400 bg-white/70 px-4 text-sm font-medium text-slate-900 hover:bg-white"
          >
            {copyEn.startAgain}
          </Link>
        </div>
      </main>
    </div>
  );
}
