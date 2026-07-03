"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn(email.trim(), pw);
    if (!result.ok) {
      setError(result.error ?? "Sign in failed.");
    }
    setLoading(false);
  };

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
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="font-mono text-[11px] uppercase tracking-label text-concrete-500">Email</label>
              <input
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-md border border-concrete-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500"
                placeholder="you@pegah.ca"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="font-mono text-[11px] uppercase tracking-label text-concrete-500">Password</label>
                <Link href="/admin/forgot-password" className="font-mono text-[11px] text-brand-700 hover:text-brand-800 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                required
                type="password"
                autoComplete="current-password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                className="mt-2 w-full rounded-md border border-concrete-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500"
              />
            </div>
            {error && (
              <p className="rounded-md bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-brand-700 px-4 py-2.5 font-display text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
