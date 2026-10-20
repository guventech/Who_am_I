import { hasLicensedHonestyHumilityItems } from "@/engine/deeper";
import type { ItemBank } from "@/engine/types";
import { env } from "./env";

/**
 * Go-deeper round availability.
 * Production stays off until a licensed Honesty-Humility item set is supplied
 * (§5.5 / §14) and ENABLE_GO_DEEPER is explicitly true.
 */
export function isGoDeeperAvailable(
  bank: ItemBank,
  textEn: Record<string, string>,
): boolean {
  if (env.NODE_ENV === "production") {
    return (
      env.ENABLE_GO_DEEPER &&
      hasLicensedHonestyHumilityItems(bank, textEn)
    );
  }
  return env.ENABLE_GO_DEEPER;
}
