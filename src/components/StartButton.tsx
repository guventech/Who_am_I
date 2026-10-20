"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { copyEn } from "@/copy/en";
import { beginFreshSession } from "@/session/session-store";

export function StartButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        disabled={loading}
        onClick={() => {
          if (loading) return;
          setLoading(true);
          beginFreshSession();
          window.setTimeout(() => {
            router.push("/test");
          }, 300);
        }}
        className="btn-primary"
      >
        {copyEn.start}
      </button>
      {loading ? (
        <p
          role="status"
          aria-live="polite"
          className="loading-status"
          data-testid="loading-status"
        >
          <span className="loading-spinner" aria-hidden />
          {copyEn.loading}
        </p>
      ) : null}
    </div>
  );
}
