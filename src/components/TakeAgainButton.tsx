"use client";

import { useRouter } from "next/navigation";
import { copyEn } from "@/copy/en";
import { clearConsent } from "@/session/consent-store";
import { clearSession } from "@/session/session-store";

type Props = {
  className?: string;
};

/** Clears session answers (and consent) then goes home. */
export function TakeAgainButton({ className = "btn-secondary" }: Props) {
  const router = useRouter();

  return (
    <button
      type="button"
      className={className}
      data-testid="take-again"
      onClick={() => {
        clearSession();
        clearConsent();
        router.push("/");
      }}
    >
      {copyEn.takeAgain}
    </button>
  );
}
