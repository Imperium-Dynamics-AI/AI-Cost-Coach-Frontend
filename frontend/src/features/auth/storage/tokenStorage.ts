import type { AuthSession, User } from "@/features/auth/types/auth";

const STORAGE_KEY = "aicc.auth.session";
const listeners = new Set<() => void>();

export type StoredSession = {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

let snapshot: StoredSession | null = null;
let snapshotRaw: string | null | undefined;

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

function emit(): void {
  listeners.forEach((listener) => listener());
}

function parseSession(raw: string | null): StoredSession | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as StoredSession;
    if (parsed.expiresAt && parsed.expiresAt < Date.now()) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export const tokenStorage = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  read(): StoredSession | null {
    if (!canUseStorage()) {
      return null;
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === snapshotRaw) {
      return snapshot;
    }

    snapshotRaw = raw;
    snapshot = parseSession(raw);
    return snapshot;
  },

  write(session: AuthSession): void {
    if (!canUseStorage()) {
      return;
    }

    const stored: StoredSession = {
      user: session.user,
      accessToken: session.tokens.accessToken,
      refreshToken: session.tokens.refreshToken,
      expiresAt: Date.now() + session.tokens.expiresIn * 1000,
    };
    const raw = JSON.stringify(stored);

    window.localStorage.setItem(STORAGE_KEY, raw);
    snapshotRaw = raw;
    snapshot = stored;
    emit();
  },

  clear(): void {
    if (!canUseStorage()) {
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
    snapshotRaw = null;
    snapshot = null;
    emit();
  },
};
