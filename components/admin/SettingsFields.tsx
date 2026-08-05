"use client";

// Labelled inputs shared by the settings-style content editors (Settings and
// Services). Kept in one place so the two pages can't drift apart visually.

export function Field({
  label,
  value,
  disabled,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  disabled: boolean;
  onChange?: (v: string) => void;
  hint?: string;
}) {
  return (
    <div>
      <label className="font-mono text-[11px] uppercase tracking-label text-accent-700">{label}</label>
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className="mt-2 w-full rounded-md border border-concrete-300 bg-surface px-4 py-2.5 text-sm outline-none focus:border-brand-500 disabled:bg-concrete-100 disabled:text-concrete-400"
      />
      {hint && <p className="mt-1.5 text-xs text-concrete-400">{hint}</p>}
    </div>
  );
}

export function TextareaField({
  label,
  value,
  disabled,
  onChange,
  rows = 3,
  hint,
}: {
  label: string;
  value: string;
  disabled: boolean;
  onChange?: (v: string) => void;
  rows?: number;
  hint?: string;
}) {
  return (
    <div>
      <label className="font-mono text-[11px] uppercase tracking-label text-accent-700">{label}</label>
      <textarea
        value={value}
        disabled={disabled}
        rows={rows}
        onChange={(e) => onChange?.(e.target.value)}
        className="mt-2 w-full rounded-md border border-concrete-300 bg-surface px-4 py-2.5 text-sm leading-relaxed outline-none focus:border-brand-500 disabled:bg-concrete-100 disabled:text-concrete-400"
      />
      {hint && <p className="mt-1.5 text-xs text-concrete-400">{hint}</p>}
    </div>
  );
}

// Banner explaining whether the current role may edit, shown at the top of both
// editors.
export function LockBanner({ locked }: { locked: boolean }) {
  return locked ? (
    <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      Site content is read-only for your role. Contact an administrator to make changes.
    </div>
  ) : (
    <div className="mb-6 rounded-lg border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-800">
      Edit any of the content below, then scroll to the bottom of the page and click{" "}
      <strong>Save changes</strong> to publish.
    </div>
  );
}

// Save button + result message, shown at the bottom of both editors.
export function SaveBar({
  onSave,
  saving,
  saved,
  error,
}: {
  onSave: () => void;
  saving: boolean;
  saved: boolean;
  error: string;
}) {
  return (
    <div className="mt-6 flex items-center gap-4">
      <button
        onClick={onSave}
        disabled={saving}
        className="rounded-md bg-brand-700 px-5 py-2.5 font-display text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
      {saved && <span className="text-sm text-emerald-600">Saved successfully.</span>}
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
}
