"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthPanel from "@/components/admin/AuthPanel";

const inputCls =
  "mt-2 w-full rounded-md border border-concrete-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Read the token from the URL on the client to avoid a Suspense boundary.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (pw.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (pw !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: pw }),
    });
    setLoading(false);
    if (res.ok) {
      setDone(true);
      setTimeout(() => router.push("/admin"), 2500);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not reset your password. Please try again.");
    }
  };

  return (
    <AuthPanel>
      {done ? (
        <div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-700">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h2 className="mt-5 font-display text-2xl font-bold tracking-tight text-ink">Password updated</h2>
          <p className="mt-2 text-sm leading-relaxed text-concrete-500">
            Your password has been changed. Redirecting you to sign in…
          </p>
          <Link href="/admin" className="mt-6 inline-flex font-display text-sm font-semibold text-brand-700 hover:text-brand-800">
            Go to sign in →
          </Link>
        </div>
      ) : token === null ? (
        // token state resolves on mount; empty string means missing
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink">Reset password</h2>
          <p className="mt-2 text-sm text-concrete-500">Loading…</p>
        </div>
      ) : token === "" ? (
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink">Invalid link</h2>
          <p className="mt-2 text-sm leading-relaxed text-concrete-500">
            This reset link is missing its token. Please request a new one.
          </p>
          <Link href="/admin/forgot-password" className="mt-6 inline-flex font-display text-sm font-semibold text-brand-700 hover:text-brand-800">
            Request a new link →
          </Link>
        </div>
      ) : (
        <>
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink">Choose a new password</h2>
          <p className="mt-1 text-sm text-concrete-500">Enter a new password for your account.</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="font-mono text-[11px] uppercase tracking-label text-concrete-500">New password</label>
              <input
                required
                type="password"
                autoComplete="new-password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                className={inputCls}
                placeholder="At least 8 characters"
              />
            </div>
            <div>
              <label className="font-mono text-[11px] uppercase tracking-label text-concrete-500">Confirm password</label>
              <input
                required
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={inputCls}
              />
            </div>
            {error && <p className="rounded-md bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-brand-700 px-4 py-2.5 font-display text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
            >
              {loading ? "Updating…" : "Update password"}
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
