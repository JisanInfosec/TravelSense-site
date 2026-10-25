"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, ApiError, tokenStore } from "./api";
import type { User } from "./types";

interface AuthState {
  user: User | null;
  /** true until the stored session has been checked */
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

/** Restores the session from the stored token, discarding it if the server rejects it. */
async function loadSession(): Promise<User | null> {
  if (!tokenStore.get()) return null;
  try {
    return await api<User>("/auth/me");
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) tokenStore.set(null);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => loadSession().then(setUser), []);

  useEffect(() => {
    loadSession().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api<{ user: User; accessToken: string }>("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    tokenStore.set(res.accessToken);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await api<{ user: User; accessToken: string }>("/auth/register", {
      method: "POST",
      body: { name, email, password },
    });
    tokenStore.set(res.accessToken);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(() => {
    void api("/auth/logout", { method: "POST" }).catch(() => undefined);
    tokenStore.set(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refresh }),
    [user, loading, login, register, logout, refresh],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
