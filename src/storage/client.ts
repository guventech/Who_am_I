import { HttpStorageAdapter } from "./http-client";
import { NoopAdapter } from "./noop";
import type { StorageAdapter } from "./types";

/**
 * Pick storage adapter. Consent off ⇒ Noop (zero network).
 * Consent on ⇒ HTTP to /api/storage (one completion payload).
 */
export function createClientStorage(opts: {
  consentStore: boolean;
  ageConfirmed: boolean;
}): StorageAdapter {
  if (!opts.consentStore || !opts.ageConfirmed) {
    return new NoopAdapter();
  }
  return new HttpStorageAdapter();
}
