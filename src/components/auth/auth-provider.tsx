"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, authRequest, getStoredToken, storeToken } from "@/lib/api";

export type Role = "admin" | "vendor" | "customer";
export type SignUpRole = "customer" | "vendor";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  isBlocked: boolean;
  image: string;
  phone: string;
  address: string;
  businessName: string;
  businessLocation: string;
  plan: "free" | "premium";
  premiumUntil: string | null;
  favoriteItemIds: string[];
  createdAt: string;
}

interface SignUpInput {
  name: string;
  email: string;
  password: string;
  role: SignUpRole;
  image?: string;
  businessName?: string;
  businessLocation?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  /** True while the stored token is being checked on first paint. */
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthUser>;
  signUp: (input: SignUpInput) => Promise<AuthUser>;
  startGoogle: (callbackPath?: string) => Promise<void>;
  /** Completes the Google redirect: swaps the session cookie for a JWT. */
  completeGoogle: () => Promise<AuthUser>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  /** Exchanges the Better Auth session cookie for our JWT. */
  const exchangeSession = useCallback(async () => {
    const data = await api<{ token: string; user: AuthUser }>("/api/account/token", {
      method: "POST",
      auth: false,
    });
    storeToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const refresh = useCallback(async () => {
    if (!getStoredToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await api<{ user: AuthUser }>("/api/account/me");
      setUser(data.user);
    } catch {
      // Expired or tampered token — start from a clean state.
      storeToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      await authRequest<{ user: unknown }>("/sign-in/email", { email, password });
      return exchangeSession();
    },
    [exchangeSession],
  );

  const signUp = useCallback(
    async (input: SignUpInput) => {
      await authRequest<{ user: unknown }>("/sign-up/email", input);
      return exchangeSession();
    },
    [exchangeSession],
  );

  /**
   * Sends the browser to Google. `disableRedirect` makes Better Auth answer
   * with the provider URL instead of redirecting by itself, so the same call
   * works from a click handler.
   */
  const startGoogle = useCallback(async (callbackPath = "/auth/callback") => {
    const { url } = await authRequest<{ url: string }>("/sign-in/social", {
      provider: "google",
      callbackURL: `${window.location.origin}${callbackPath}`,
      disableRedirect: true,
    });
    window.location.assign(url);
  }, []);

  const signOut = useCallback(async () => {
    await api<{ ok: boolean }>("/api/account/logout", {
      method: "POST",
      auth: false,
    }).catch(() => undefined);
    storeToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signIn,
      signUp,
      startGoogle,
      completeGoogle: exchangeSession,
      signOut,
      refresh,
      setUser,
    }),
    [user, loading, signIn, signUp, startGoogle, exchangeSession, signOut, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}

/** Where a signed-in user belongs after auth. */
export function homeFor(role: Role): string {
  if (role === "admin") return "/admin";
  return "/dashboard";
}