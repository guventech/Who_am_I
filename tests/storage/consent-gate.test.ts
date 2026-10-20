import { describe, expect, it } from "vitest";
import { assertStorageConsent } from "@/storage/consent-gate";

describe("assertStorageConsent", () => {
  it("accepts store + age confirmed", () => {
    expect(
      assertStorageConsent({ consentStore: true, ageConfirmed: true }),
    ).toEqual({ ok: true });
  });

  it("rejects missing consent or age", () => {
    expect(
      assertStorageConsent({ consentStore: false, ageConfirmed: true }),
    ).toEqual({ ok: false, reason: "consent_required" });
    expect(
      assertStorageConsent({ consentStore: true, ageConfirmed: false }),
    ).toEqual({ ok: false, reason: "consent_required" });
  });
});
