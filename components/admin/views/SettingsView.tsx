"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { permsFor } from "@/lib/admin";
import { Card, Spinner } from "../ui";
import { Field, TextareaField, LockBanner, SaveBar } from "../SettingsFields";
import { getStorageUrl } from "@/lib/storage-url";
import { SETTINGS_DEFAULTS } from "@/lib/settings";

type Settings = Record<string, string>;
type HeroImage = { id: number; path: string; order: number };

export default function SettingsView() {
  const { user } = useAuth();
  const [form, setForm] = useState<Settings>({ ...SETTINGS_DEFAULTS });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [uploadingHero, setUploadingHero] = useState(false);
  const heroInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setForm({ ...SETTINGS_DEFAULTS, ...data }))
      .catch(() => {});
    fetch("/api/hero-images")
      .then((r) => r.json())
      .then((d) => setHeroImages(Array.isArray(d) ? d : []))
      .catch(() => setHeroImages([]));
  }, []);

  if (!user) return null;
  const locked = !permsFor(user.role).editSettings;

  const set = (k: string) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

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
      <LockBanner locked={locked} />

      <div className="grid gap-6">
        <Card title="Organization &amp; contact details">
          <div className="grid gap-5 p-5 sm:grid-cols-2">
            <Field label="Company name" value={form.companyName} disabled={locked} onChange={set("companyName")} />
            <Field label="Main phone" value={form.phone} disabled={locked} onChange={set("phone")} />
            <Field label="Email" value={form.email} disabled={locked} onChange={set("email")} />
            <Field label="Estimating email" value={form.estimatingEmail} disabled={locked} onChange={set("estimatingEmail")} />
            <Field label="Address line 1" value={form.addressLine1} disabled={locked} onChange={set("addressLine1")} />
            <Field label="Address line 2" value={form.addressLine2} disabled={locked} onChange={set("addressLine2")} />
          </div>
        </Card>

        <Card title="Home page">
          <div className="grid gap-5 p-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Hero eyebrow" value={form.heroEyebrow} disabled={locked} onChange={set("heroEyebrow")} />
              <Field label="Hero title" value={form.heroTitle} disabled={locked} onChange={set("heroTitle")} hint="Line breaks are preserved." />
            </div>
            <TextareaField label="Hero subtitle" value={form.heroSubtitle} disabled={locked} onChange={set("heroSubtitle")} rows={2} />
            <TextareaField label="Intro heading" value={form.introHeading} disabled={locked} onChange={set("introHeading")} rows={2} />
            <TextareaField label="Intro text" value={form.introText} disabled={locked} onChange={set("introText")} rows={3} />
          </div>
        </Card>

        <Card title="Contact page">
          <div className="grid gap-5 p-5">
            <Field label="Contact title" value={form.contactTitle} disabled={locked} onChange={set("contactTitle")} />
            <TextareaField label="Contact intro" value={form.contactIntro} disabled={locked} onChange={set("contactIntro")} rows={2} />
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
            <input ref={heroInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleHeroUpload} />
          </div>
        </Card>
      </div>

      {!locked && <SaveBar onSave={handleSave} saving={saving} saved={saved} error={error} />}
    </>
  );
}
