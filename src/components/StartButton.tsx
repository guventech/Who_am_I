"use client";

import { useRouter } from "next/navigation";
import { copyEn } from "@/copy/en";
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
      className="btn-primary"
    >
      {copyEn.start}
    </button>
  );
}
