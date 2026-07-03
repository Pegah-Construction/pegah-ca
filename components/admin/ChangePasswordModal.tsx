"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Modal, Field, inputCls } from "./ui";

export default function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (next.length < 8) { setError("New password must be at least 8 characters."); return; }
    if (next !== confirm) { setError("New passwords do not match."); return; }
    setSaving(true);
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, newPassword: next }),
    });
    setSaving(false);
    if (res.ok) {
      setDone(true);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not change your password.");
    }
  };

  return (
    <Modal title="Change password" onClose={onClose}>
      {done ? (
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-700">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h3 className="mt-4 font-display text-lg font-bold text-ink">Password changed</h3>
          <p className="mt-1 text-sm text-concrete-500">Your password has been updated successfully.</p>
          <button
            onClick={onClose}
            className="mt-6 rounded-md bg-brand-700 px-5 py-2.5 font-display text-sm font-semibold text-white hover:bg-brand-800"
          >
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="New password">
            <input
              required
              type="password"
              autoComplete="new-password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              className={inputCls}
              placeholder="At least 8 characters"
            />
          </Field>
          <Field label="Confirm new password">
            <input
              required
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={inputCls}
            />
          </Field>
          {error && <p className="rounded-md bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 font-display text-sm font-semibold text-concrete-500 hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-brand-700 px-4 py-2 font-display text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Change password"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
