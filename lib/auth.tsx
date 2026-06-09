"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { USERS, type User } from "./admin";

const KEY = "pegah_admin_uid";

type AuthCtx = {
  user: User | null;
  ready: boolean;
  signIn: (id: string) => void;
  signOut: () => void;
};

const Ctx = createContext<AuthCtx>({
  user: null, ready: false, signIn: () => {}, signOut: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    setUser(id ? USERS.find((u) => u.id === id) ?? null : null);
    setReady(true);
  }, []);

  const signIn = (id: string) => {
    localStorage.setItem(KEY, id);
    setUser(USERS.find((u) => u.id === id) ?? null);
  };
  const signOut = () => {
    localStorage.removeItem(KEY);
    setUser(null);
  };

  return <Ctx.Provider value={{ user, ready, signIn, signOut }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
