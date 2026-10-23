import type { TestSession } from "./run-session";
import { createSession } from "./run-session";

const KEY = "whoami-session-v1";

let memory: TestSession | null = null;
const listeners = new Set<() => void>();

function readStorage(): TestSession | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TestSession;
  } catch {
    return null;
  }
}

function writeStorage(session: TestSession | null): void {
  if (typeof window === "undefined") return;
  if (!session) {
    sessionStorage.removeItem(KEY);
    return;
  }
  sessionStorage.setItem(KEY, JSON.stringify(session));
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
  if (memory) return memory;
  const loaded = readStorage();
  memory = loaded ? normalizeSession(loaded) : null;
  return memory;
}

export function getServerSessionSnapshot(): TestSession | null {
  return null;
}

export function saveSession(session: TestSession): void {
  memory = session;
  writeStorage(session);
  emit();
}

export function clearSession(): void {
  memory = null;
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
