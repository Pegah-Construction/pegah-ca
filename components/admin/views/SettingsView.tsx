"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { PERMS } from "@/lib/admin";
import { Card, Spinner } from "../ui";
import { getStorageUrl } from "@/lib/storage-url";

type OrgSettings = { companyName: string; phone: string; email: string; address: string };
type HeroImage = { id: number; path: string; order: number };

const DEFAULTS: OrgSettings = {
  companyName: "Pegah Construction Ltd.",
  phone: "416 739 9300",
  email: "info@pegah.ca",
  address: "5050 Dufferin Street, Toronto",
};

function Field({ label, value, disabled, onChange }: { label: string; value: string; disabled: boolean; onChange?: (v: string) => void }) {
  return (
    <div>
      <label className="font-mono text-[11px] uppercase tracking-label text-concrete-500">{label}</label>
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className="mt-2 w-full rounded-md border border-concrete-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 disabled:bg-concrete-100 disabled:text-concrete-400"
      />
    </div>
  );
}

// function ToggleRow({ t, s, defaultOn, locked }: { t: string; s: string; defaultOn: boolean; locked: boolean }) {
//   const [on, setOn] = useState(defaultOn);
//   return (
//     <div className="flex items-center justify-between rounded-lg px-3 py-3">
//       <div>
//         <div className="font-display text-sm font-semibold text-ink">{t}</div>
//         <div className="text-sm text-concrete-500">{s}</div>
//       </div>
//       <button
//         type="button"
//         disabled={locked}
//         onClick={() => setOn((v) => !v)}
//         className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${on ? "bg-brand-600" : "bg-concrete-300"} ${locked ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
//       >
//         <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${on ? "translate-x-5" : "translate-x-1"}`} />
//       </button>
//     </div>
//   );
// }

export default function SettingsView() {
  const { user } = useAuth();
  const [form, setForm] = useState<OrgSettings>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [uploadingHero, setUploadingHero] = useState(false);
  const heroInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((data) => setForm({ ...DEFAULTS, ...data }));
    fetch("/api/hero-images").then((r) => r.json()).then(setHeroImages);
  }, []);

  if (!user) return null;
  const locked = !PERMS[user.role].editSettings;

  const set = (k: keyof OrgSettings) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError("");
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError("Failed to save settings.");
    }
    setSaving(false);
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadingHero(true);
    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/hero-images", { method: "POST", body: fd });
      if (res.ok) {
        const img = await res.json();
        setHeroImages((prev) => [...prev, img]);
      }
    }
    setUploadingHero(false);
    if (heroInputRef.current) heroInputRef.current.value = "";
  };

  const handleHeroDelete = async (id: number) => {
    if (!confirm("Remove this hero image?")) return;
    const res = await fetch(`/api/hero-images/${id}`, { method: "DELETE" });
    if (res.ok) setHeroImages((prev) => prev.filter((img) => img.id !== id));
  };

  return (
    <>
      {locked && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Organization settings are read-only for your role. Contact an administrator to make changes.
        </div>
      )}
      <div className="grid gap-6">
        <Card title="Organization">
          <div className="grid gap-5 p-5 sm:grid-cols-2">
            <Field label="Company name" value={form.companyName} disabled={locked} onChange={set("companyName")} />
            <Field label="Main phone" value={form.phone} disabled={locked} onChange={set("phone")} />
            <Field label="Email" value={form.email} disabled={locked} onChange={set("email")} />
            <Field label="Head office" value={form.address} disabled={locked} onChange={set("address")} />
          </div>
        </Card>

        <Card title="Home page hero images">
          <div className="p-5">
            <p className="mb-4 text-sm text-concrete-500">
              These images appear as the full-bleed background on the home page.
              {heroImages.length > 1 && " Multiple images will cycle as a carousel."}
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {heroImages.map((img) => (
                <div key={img.id} className="group relative overflow-hidden rounded-lg bg-concrete-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={getStorageUrl(img.path)} alt="" className="aspect-video w-full object-cover" />
                  {!locked && (
                    <button
                      onClick={() => handleHeroDelete(img.id)}
                      className="absolute right-1.5 top-1.5 rounded-full bg-black/50 p-1 text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-600"
                      aria-label="Remove image"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              {!locked && (
                <button
                  type="button"
                  onClick={() => heroInputRef.current?.click()}
                  disabled={uploadingHero}
                  className="flex aspect-video items-center justify-center rounded-lg border-2 border-dashed border-concrete-300 text-concrete-400 transition hover:border-brand-400 hover:text-brand-500 disabled:opacity-50"
                >
                  {uploadingHero ? (
                    <Spinner className="h-5 w-5" />
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  )}
                </button>
              )}
            </div>
            <input
              ref={heroInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleHeroUpload}
            />
          </div>
        </Card>

        {/* Preferences — commented out until backend is wired up
        <Card title="Preferences">
          <div className="space-y-1 p-2">
            <ToggleRow t="Email notifications" s="New incidents and task assignments" defaultOn locked={locked} />
            <ToggleRow t="Weekly project digest" s="Monday morning summary of all projects" defaultOn locked={locked} />
            <ToggleRow t="Two-factor authentication" s="Require a second factor at sign-in" defaultOn={false} locked={locked} />
          </div>
        </Card>
        */}
      </div>

      {!locked && (
        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-brand-700 px-5 py-2.5 font-display text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          {saved && <span className="text-sm text-emerald-600">Saved successfully.</span>}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      )}
    </>
  );
}
