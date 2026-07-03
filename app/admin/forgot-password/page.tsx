"use client";

import { useState } from "react";
import Link from "next/link";
import AuthPanel from "@/components/admin/AuthPanel";

const inputCls =
  "mt-2 w-full rounded-md border border-concrete-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    }).catch(() => {});
    setLoading(false);
    setSent(true);
  };

  return (
    <AuthPanel>
      {sent ? (
        <div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-brand-700">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><path d="m22 6-10 7L2 6" />
            </svg>
          </div>
          <h2 className="mt-5 font-display text-2xl font-bold tracking-tight text-ink">Check your email</h2>
          <p className="mt-2 text-sm leading-relaxed text-concrete-500">
            If an account exists for <span className="font-semibold text-ink">{email.trim()}</span>, we&rsquo;ve sent a link to reset your password. The link expires in 1 hour.
          </p>
          <Link href="/admin" className="mt-6 inline-flex font-display text-sm font-semibold text-brand-700 hover:text-brand-800">
            ← Back to sign in
          </Link>
        </div>
      ) : (
        <>
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink">Forgot password</h2>
          <p className="mt-1 text-sm text-concrete-500">Enter your email and we&rsquo;ll send you a reset link.</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="font-mono text-[11px] uppercase tracking-label text-concrete-500">Email</label>
              <input
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
                placeholder="you@pegah.ca"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-brand-700 px-4 py-2.5 font-display text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
          <Link href="/admin" className="mt-6 inline-flex font-display text-sm font-semibold text-brand-700 hover:text-brand-800">
            ← Back to sign in
          </Link>
        </>
      )}
    </AuthPanel>
  );
}
