"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { USERS, DEMO_ACCOUNTS, ROLES } from "@/lib/admin";
import { Avatar, RolePill } from "./ui";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("s.chen@pegah.ca");
  const [pw, setPw] = useState("demo1234");

  return (
    <div className="grid min-h-screen bg-paper lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between bg-brand-900 p-12 lg:flex">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-white font-display text-xl font-black text-brand-800">P</span>
          <span className="font-display text-lg font-extrabold tracking-tight text-white">PEGAH<span className="text-brand-300"> Admin</span></span>
        </div>
        <div>
          <h1 className="font-display text-4xl font-black leading-tight tracking-tight text-white">Project &amp; operations console</h1>
          <p className="mt-4 max-w-sm text-lg leading-relaxed text-brand-100/80">Monitor projects, teams, safety and documents across every Pegah site — all in one place.</p>
        </div>
        <p className="font-mono text-[11px] text-brand-200/60">Internal use only · Pegah Construction Ltd.</p>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink">Staff sign in</h2>
          <p className="mt-1 text-sm text-concrete-500">Welcome back. Sign in to your console.</p>
          <div className="mt-6 space-y-4">
            <div>
              <label className="font-mono text-[11px] uppercase tracking-label text-concrete-500">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-md border border-concrete-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
            </div>
            <div>
              <label className="font-mono text-[11px] uppercase tracking-label text-concrete-500">Password</label>
              <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} className="mt-2 w-full rounded-md border border-concrete-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
            </div>
            <button onClick={() => signIn("u1")} className="w-full rounded-md bg-brand-700 px-4 py-2.5 font-display text-sm font-semibold text-white hover:bg-brand-800">Sign in</button>
          </div>

          <div className="my-6 flex items-center gap-3 text-concrete-400">
            <span className="h-px flex-1 bg-concrete-200" />
            <span className="font-mono text-[11px] uppercase tracking-wide">Quick demo access</span>
            <span className="h-px flex-1 bg-concrete-200" />
          </div>

          <div className="space-y-2">
            {DEMO_ACCOUNTS.map((id) => {
              const m = USERS.find((u) => u.id === id)!;
              return (
                <button key={id} onClick={() => signIn(id)} className="flex w-full items-center gap-3 rounded-xl border border-concrete-200 bg-white px-4 py-3 text-left transition-colors hover:border-brand-400 hover:bg-brand-50/40">
                  <Avatar name={m.name} id={m.id} size="h-10 w-10 text-sm" />
                  <div className="flex-1">
                    <div className="font-display text-sm font-bold text-ink">{m.name}</div>
                    <div className="font-mono text-[11px] text-concrete-500">{m.title}</div>
                  </div>
                  <RolePill role={m.role} />
                </button>
              );
            })}
          </div>
          <p className="mt-6 text-center font-mono text-[11px] text-concrete-400">Mock environment — choose any role to explore permissions.</p>
        </div>
      </div>
    </div>
  );
}
