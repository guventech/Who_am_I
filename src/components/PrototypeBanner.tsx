import { copyEn } from "@/content/copy.en";
import type { BankStatus } from "@/engine/types";

export function PrototypeBanner({ bankStatus }: { bankStatus: BankStatus }) {
  if (bankStatus !== "dev-uncalibrated") return null;
  return (
    <div
      role="status"
      className="border-b border-amber-800/20 bg-amber-100 px-4 py-2 text-center text-sm font-medium text-amber-950"
    >
      {copyEn.prototypeBanner}
    </div>
  );
}
