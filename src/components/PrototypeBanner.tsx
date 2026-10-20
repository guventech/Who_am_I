import { copyEn } from "@/copy/en";
import type { BankStatus } from "@/engine/types";

type Props = {
  bankStatus: BankStatus;
};

export function PrototypeBanner({ bankStatus }: Props) {
  if (bankStatus === "calibrated") return null;
  return (
    <div
      role="status"
      className="px-4 py-2 text-center text-sm"
      style={{ background: "var(--banner-bg)", color: "var(--banner-ink)" }}
    >
      {copyEn.prototypeBanner}
    </div>
  );
}
