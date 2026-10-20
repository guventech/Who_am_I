export type ConsentState = {
  store: boolean;
  ageConfirmed: boolean;
  retakeLater: boolean;
};

const KEY = "whoami-consent-v1";

const DEFAULT: ConsentState = {
  store: false,
  ageConfirmed: false,
  retakeLater: false,
};

let memory: ConsentState | null = null;
const listeners = new Set<() => void>();

function read(): ConsentState {
  if (typeof window === "undefined") return DEFAULT;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return DEFAULT;
  try {
    return { ...DEFAULT, ...(JSON.parse(raw) as ConsentState) };
  } catch {
    return DEFAULT;
  }
}

function write(state: ConsentState): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(state));
}

function emit(): void {
  for (const l of listeners) l();
}

export function subscribeConsent(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getConsentSnapshot(): ConsentState {
  if (!memory) memory = read();
  return memory;
}

export function getServerConsentSnapshot(): ConsentState {
  return DEFAULT;
}

export function setConsent( partial: Partial<ConsentState>): ConsentState {
  const next = { ...getConsentSnapshot(), ...partial };
  // Age gate only meaningful when storing
  if (!next.store) {
    next.ageConfirmed = false;
    next.retakeLater = false;
  }
  memory = next;
  write(next);
  emit();
  return next;
}

export function hasStorageConsent(state: ConsentState = getConsentSnapshot()): boolean {
  return state.store && state.ageConfirmed;
}
