"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { type User } from "./admin";

const KEY = "pegah_admin_user";

type AuthCtx = {
  user: User | null;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => void;
};

const Ctx = createContext<AuthCtx>({
  user: null, ready: false,
  signIn: async () => ({ ok: false }),
  signOut: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { /* stale */ }
    }
    setReady(true);
  }, []);

  const signIn = async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { ok: false, error: data.error ?? "Sign in failed." };
    }
    const userData: User = await res.json();
    localStorage.setItem(KEY, JSON.stringify(userData));
    setUser(userData);
    return { ok: true };
  };

  const signOut = () => {
    localStorage.removeItem(KEY);
    setUser(null);
  };

  return <Ctx.Provider value={{ user, ready, signIn, signOut }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
