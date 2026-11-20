import { useSyncExternalStore } from "react";

export type Role = "customer" | "vendor" | "admin";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  image?: string;
}

export const TOKEN_KEY = "pizzahub_token";
export const USER_KEY = "pizzahub_user";

/**
 * Tiny client-side session store.
 * Token lives in localStorage and is sent as `Authorization: Bearer` (plan 3C).
 * The cached user below is only for instant navbar rendering; the server
 * re-verifies the JWT and loads the user fresh from DB on every request.
 * Later auth wiring just calls setSession()/clearSession() → navbar updates
 * immediately, no reload.
 */
let session: SessionUser | null = null;
let token: string | null = null;
const listeners = new Set<() => void>();

function readFromStorage(): void {
  if (typeof window === "undefined") return;
  try {
    token = window.localStorage.getItem(TOKEN_KEY);
    const raw = window.localStorage.getItem(USER_KEY);
    session = raw ? (JSON.parse(raw) as SessionUser) : null;
    if (!token) session = null;
  } catch {
    token = null;
    session = null;
  }
}

function emit(): void {
  listeners.forEach((l) => l());
}

export function getSession(): SessionUser | null {
  if (typeof window === "undefined") return null;
  if (token === null && session === null) readFromStorage();
  return session;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  if (token === null && session === null) readFromStorage();
  return token;
}

export function setSession(user: SessionUser, jwt: string): void {
  session = user;
  token = jwt;
  try {
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    window.localStorage.setItem(TOKEN_KEY, jwt);
  } catch {
    /* storage full/blocked — in-memory session still works */
  }
  emit();
}

export function clearSession(): void {
  session = null;
  token = null;
  try {
    window.localStorage.removeItem(USER_KEY);
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
  emit();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** SSR snapshot stays null to avoid hydration mismatch. */
const serverSnapshot: SessionUser | null = null;

export function useSession(): SessionUser | null {
  return useSyncExternalStore(subscribe, getSession, () => serverSnapshot);
}
