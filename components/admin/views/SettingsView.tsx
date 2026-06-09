"use client";

import { useAuth } from "@/lib/auth";
import { PERMS } from "@/lib/admin";
import { Card } from "../ui";

function Field({ label, value, disabled }: { label: string; value: string; disabled: boolean }) {
  return (
    <div>
      <label className="font-mono text-[11px] uppercase tracking-label text-concrete-500">{label}</label>
      <input defaultValue={value} disabled={disabled} className="mt-2 w-full rounded-md border border-concrete-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 disabled:bg-concrete-100 disabled:text-concrete-400" />
    </div>
  );
}

function ToggleRow({ t, s, on, locked }: { t: string; s: string; on: boolean; locked: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg px-3 py-3">
      <div>
        <div className="font-display text-sm font-semibold text-ink">{t}</div>
        <div className="text-sm text-concrete-500">{s}</div>
      </div>
      <span className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full ${on ? "bg-brand-600" : "bg-concrete-300"} ${locked ? "opacity-50" : ""}`}>
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${on ? "translate-x-5" : "translate-x-1"}`} />
      </span>
    </div>
  );
}

export default function SettingsView() {
  const { user } = useAuth();
  if (!user) return null;
  const locked = !PERMS[user.role].editSettings;

  return (
    <>
      {locked && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Organization settings are read-only for your role. Contact an administrator to make changes.
        </div>
      )}
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Organization">
          <div className="grid gap-5 p-5 sm:grid-cols-2">
            <Field label="Company name" value="Pegah Construction Ltd." disabled={locked} />
            <Field label="Main phone" value="416 739 9300" disabled={locked} />
            <Field label="Email" value="info@pegah.ca" disabled={locked} />
            <Field label="Head office" value="5050 Dufferin Street, Toronto" disabled={locked} />
          </div>
        </Card>
        <Card title="Preferences">
          <div className="space-y-1 p-2">
            <ToggleRow t="Email notifications" s="New incidents and task assignments" on locked={locked} />
            <ToggleRow t="Weekly project digest" s="Monday morning summary of all projects" on locked={locked} />
            <ToggleRow t="Two-factor authentication" s="Require a second factor at sign-in" on={false} locked={locked} />
          </div>
        </Card>
      </div>
      {!locked && (
        <div className="mt-6">
          <button className="rounded-md bg-brand-700 px-5 py-2.5 font-display text-sm font-semibold text-white hover:bg-brand-800">Save changes</button>
        </div>
      )}
    </>
  );
}
