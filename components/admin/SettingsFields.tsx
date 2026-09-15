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

export function SelectField({
  label,
  value,
  disabled,
  onChange,
  options,
  hint,
}: {
  label: string;
  value: string;
  disabled: boolean;
  onChange?: (v: string) => void;
  options: { value: string; label: string }[];
  hint?: string;
}) {
  return (
    <div>
      <label className="font-mono text-[11px] uppercase tracking-label text-accent-700">{label}</label>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className="mt-2 w-full rounded-md border border-concrete-300 bg-surface px-4 py-2.5 text-sm outline-none focus:border-brand-500 disabled:bg-concrete-100 disabled:text-concrete-400"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {hint && <p className="mt-1.5 text-xs text-concrete-400">{hint}</p>}
    </div>
  );
}

/** On/off stored as the string "1" / "0", like every other setting. */
export function ToggleField({
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
  const on = value !== "0" && value !== "false" && value !== "";
  return (
    <div>
      <label className="font-mono text-[11px] uppercase tracking-label text-accent-700">{label}</label>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        disabled={disabled}
        onClick={() => onChange?.(on ? "0" : "1")}
        className={`mt-2 flex w-full items-center gap-3 rounded-md border px-4 py-2.5 text-left text-sm transition-colors disabled:bg-concrete-100 disabled:text-concrete-400 ${
          on ? "border-brand-500 bg-brand-50 text-ink" : "border-concrete-300 bg-surface text-concrete-500"
        }`}
      >
        <span
          className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${on ? "bg-brand-600" : "bg-concrete-300"}`}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${on ? "left-[1.125rem]" : "left-0.5"}`}
          />
        </span>
        {on ? "Shown on the website" : "Hidden from the website"}
      </button>
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
