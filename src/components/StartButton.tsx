"use client";

import { useRouter } from "next/navigation";
import { copyEn } from "@/content/copy.en";
import { beginFreshSession } from "@/session/session-store";

export function StartButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        beginFreshSession();
        router.push("/test");
      }}
      className="inline-flex h-12 items-center justify-center rounded-md bg-slate-900 px-6 text-base font-medium text-white transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
    >
      {copyEn.start}
    </button>
  );
}
