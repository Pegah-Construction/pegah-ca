"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { permsFor } from "@/lib/admin";
import { Card } from "../ui";
import { Field, TextareaField, LockBanner, SaveBar } from "../SettingsFields";
import { SETTINGS_DEFAULTS, fillCount, parseServices } from "@/lib/settings";

// The settings keys this page owns. Only these are sent on save, so it can never
// overwrite copy belonging to another editor.
const KEYS = [
  "servicesEyebrow",
  "servicesTitle",
  "servicesHomeHeading",
  "servicesIntro",
  "servicesList",
] as const;

// What {count} currently resolves to, so the hint shows the live value while the
// list is being edited.
const countWord = (servicesList: string) =>
  fillCount("{count}", parseServices(servicesList).length);

export default function ServicesView() {
  const [form, setForm] = useState<Record<string, string>>({ ...SETTINGS_DEFAULTS });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setForm({ ...SETTINGS_DEFAULTS, ...data }))
      .catch(() => {});
  }, []);

  if (!user) return null;
  const locked = !permsFor(user.role).editSettings;

  const set = (k: string) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError("");
    const payload = Object.fromEntries(KEYS.map((k) => [k, form[k] ?? ""]));
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError("Failed to save services.");
    }
    setSaving(false);
  };

  const services = parseServices(form.servicesList ?? "");

  return (
    <>
      <LockBanner locked={locked} />

      <div className="grid gap-6">
        <Card title="Headings">
          <div className="grid gap-5 p-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Eyebrow"
                value={form.servicesEyebrow}
                disabled={locked}
                onChange={set("servicesEyebrow")}
                hint="Small label above the heading, on both the services page and the home page section."
              />
              <Field
                label="Page title"
                value={form.servicesTitle}
                disabled={locked}
                onChange={set("servicesTitle")}
                hint="The services page heading, and the browser tab title."
              />
            </div>
            <TextareaField
              label="Home page section heading"
              value={form.servicesHomeHeading}
              disabled={locked}
              onChange={set("servicesHomeHeading")}
              rows={2}
              hint={`Heading above the service cards on the home page. Write {count} for the number of services spelled out, or {n} for digits — either one updates itself when you add or remove a service below. Right now {count} is "${countWord(form.servicesList ?? "")}".`}
            />
            <TextareaField
              label="Intro"
              value={form.servicesIntro}
              disabled={locked}
              onChange={set("servicesIntro")}
              rows={2}
              hint="Shown under the services page title, and used as the page's search-result description."
            />
          </div>
        </Card>

        <Card title={`Services list (${services.length})`}>
          <div className="grid gap-5 p-5">
            <TextareaField
              label="Services"
              value={form.servicesList}
              disabled={locked}
              onChange={set("servicesList")}
              rows={8}
              hint={'One service per line, written as "Title | description".'}
            />

            {/* Parsed preview so a mistyped separator is obvious before saving. */}
            <div>
              <p className="font-mono text-[11px] uppercase tracking-label text-accent-700">Preview</p>
              {services.length === 0 ? (
                <p className="mt-2 text-sm text-concrete-400">
                  No services yet. Add one per line above — the home page section is hidden while this
                  list is empty.
                </p>
              ) : (
                <ol className="mt-2 divide-y divide-concrete-100 rounded-md border border-concrete-200">
                  {services.map((s, i) => (
                    <li key={`${s.slug}-${i}`} className="flex gap-3 px-4 py-3">
                      <span className="font-mono text-xs text-concrete-400">{i + 1}</span>
                      <div className="min-w-0">
                        <div className="font-display text-sm font-semibold text-ink">{s.title}</div>
                        {s.desc ? (
                          <div className="mt-0.5 text-sm text-concrete-500">{s.desc}</div>
                        ) : (
                          <div className="mt-0.5 text-sm text-amber-700">
                            No description — add one after a “|” on this line.
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </Card>
      </div>

      {!locked && <SaveBar onSave={handleSave} saving={saving} saved={saved} error={error} />}
    </>
  );
}
