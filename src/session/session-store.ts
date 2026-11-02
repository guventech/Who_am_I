import type { TestSession } from "./run-session";
import { createSession } from "./run-session";
import { sessionSchema } from "./session-schema";

const KEY = "whoami-session-v1";

let memory: TestSession | null = null;
let loaded = false;
export type SessionStorageStatus = "available" | "unavailable" | "invalid";
let storageStatus: SessionStorageStatus = "available";
const listeners = new Set<() => void>();

function readStorage(): TestSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    let decoded: unknown;
    try {
      decoded = JSON.parse(raw);
    } catch {
      storageStatus = "invalid";
      return null;
    }
    const parsed = sessionSchema.safeParse(decoded);
    if (!parsed.success) {
      storageStatus = "invalid";
      return null;
    }
    return normalizeSession(parsed.data as TestSession);
  } catch {
    storageStatus = "unavailable";
    return null;
  }
}

function writeStorage(session: TestSession | null): void {
  if (typeof window === "undefined") return;
  try {
    if (!session) window.sessionStorage.removeItem(KEY);
    else window.sessionStorage.setItem(KEY, JSON.stringify(session));
    storageStatus = "available";
  } catch {
    // The in-memory session remains usable when browser storage is blocked or full.
    storageStatus = "unavailable";
  }
}

function emit(): void {
  for (const listener of listeners) listener();
}

/** Subscribe for useSyncExternalStore. */
export function subscribeSession(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function normalizeSession(raw: TestSession): TestSession {
  return {
    ...createSession(raw.seed),
    ...raw,
    completionId: raw.completionId ?? crypto.randomUUID(),
    storagePayload: raw.storagePayload ?? null,
    sessionCode: raw.sessionCode ?? null,
    storageSaved: raw.storageSaved ?? false,
    storageError: raw.storageError ?? null,
    shownInsightIds: raw.shownInsightIds ?? [],
    startDay: raw.startDay ?? new Date().toISOString().slice(0, 10),
    round: raw.round ?? "core",
  };
}

export function getSessionSnapshot(): TestSession | null {
  if (typeof window === "undefined") return null;
  if (!loaded) {
    loaded = true;
    memory = readStorage();
  }
  return memory;
}

export function getSessionStorageStatus(): SessionStorageStatus {
  getSessionSnapshot();
  return storageStatus;
}

export function getServerStorageStatus(): SessionStorageStatus {
  return "available";
}

export function getServerSessionSnapshot(): TestSession | null {
  return null;
}

export function saveSession(session: TestSession): void {
  memory = session;
  loaded = true;
  writeStorage(session);
  emit();
}

export function clearSession(): void {
  memory = null;
  loaded = true;
  writeStorage(null);
  emit();
}

/** Start a fresh test session (clears any completed or stale run). */
export function beginFreshSession(seed?: number): TestSession {
  const session = createSession(seed);
  saveSession(session);
  return session;
}

/** Resume in-progress core answers, or start fresh. */
export function ensureActiveSession(): TestSession {
  const existing = getSessionSnapshot();
  if (
    existing &&
    existing.round === "core" &&
    !existing.completed &&
    existing.answered.length < 10
  ) {
    return existing;
  }
  return beginFreshSession();
}
