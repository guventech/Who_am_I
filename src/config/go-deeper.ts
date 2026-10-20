import { hasVerifiedHonestyHumilityItems } from "@/engine/deeper";
import type { ItemBank } from "@/engine/types";
import { env } from "./env";

/**
 * Go-deeper round availability.
 * Production stays off until verified H-H items exist and
 * NEXT_PUBLIC_ENABLE_GO_DEEPER / ENABLE_GO_DEEPER is explicitly true.
 */
export function isGoDeeperAvailable(
  bank: ItemBank,
  textEn: Record<string, string>,
): boolean {
  if (!env.ENABLE_GO_DEEPER) return false;
  if (env.NODE_ENV === "production") {
    return hasVerifiedHonestyHumilityItems(bank, textEn);
  }
  return true;
}
