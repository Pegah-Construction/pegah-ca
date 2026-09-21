"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { permsFor } from "@/lib/admin";
import { Card, PrimaryBtn, Spinner } from "../ui";
import { DropTarget } from "../DropZone";
import { Field, TextareaField, SelectField, ToggleField, LockBanner, SaveBar } from "../SettingsFields";
import { SETTINGS_DEFAULTS, fillCount, parseServices, removeServiceLine, setServiceImage } from "@/lib/settings";
import { getStorageUrl } from "@/lib/storage-url";

// The settings keys this page owns. Only these are sent on save, so it can never
// overwrite copy belonging to another editor.
const KEYS = [
  "servicesEyebrow",
  "servicesHomeHeading",
  "servicesIntro",
  "servicesList",
  "servicesVisible",
  "servicesColumns",
  "servicesImageShape",
  "servicesBackground",
  "servicesSpacing",
  "servicesHeadingSize",
  "servicesAlign",
  "servicesAccentBar",
  "servicesAnimate",
  "servicesImageZoom",
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
  // Index of the row whose image is uploading, so only that thumbnail spins.
  const [uploading, setUploading] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const targetRow = useRef<number>(0);
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

  // The uploaded path is written straight back into the service's own line, so
  // the list stays the single source of truth and one Save publishes the copy
  // and the images together.
  const uploadImage = async (row: number, file: File) => {
    setUploading(row);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    if (services[row]?.image) fd.append("previous", services[row].image);
    try {
      const res = await fetch("/api/services/image", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.image) throw new Error(data.error ?? "Upload failed");
      setForm((f) => ({ ...f, servicesList: setServiceImage(f.servicesList ?? "", row, data.image) }));
    } catch {
      setError("Image upload failed. Please try again.");
    } finally {
      setUploading(null);
    }
  };

  const clearImage = async (row: number) => {
    const path = services[row]?.image;
    setForm((f) => ({ ...f, servicesList: setServiceImage(f.servicesList ?? "", row, "") }));
    if (path) {
      await fetch(`/api/services/image?path=${encodeURIComponent(path)}`, { method: "DELETE" }).catch(() => {});
    }
  };

  /**
   * Delete the whole service — its title, description and image reference — not
   * just the picture. The uploaded file itself is deliberately left in storage:
   * this only edits the form, so until Save is clicked the removal can still be
   * abandoned by reloading, and deleting the photo now would make that
   * unrecoverable.
   */
  const removeService = (row: number) => {
    const s = services[row];
    if (!s) return;
    const label = s.title || `service ${row + 1}`;
    const ok = confirm(
      `Remove "${label}" from the services list?\n\nThe whole card goes — title, description and image. Nothing is published until you click Save changes.`
    );
    if (!ok) return;
    setForm((f) => ({ ...f, servicesList: removeServiceLine(f.servicesList ?? "", row) }));
    setError("");
  };

  return (
    <>
      <LockBanner locked={locked} />

      {/* One hidden picker, retargeted at whichever row's button was clicked. */}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileRef}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) uploadImage(targetRow.current, f);
          e.target.value = "";
        }}
      />

      <div className="grid gap-6">
        <Card title="Headings">
          <div className="grid gap-5 p-5">
            <Field
              label="Eyebrow"
              value={form.servicesEyebrow}
              disabled={locked}
              onChange={set("servicesEyebrow")}
              hint="Small label above the heading of the services section on the home page."
            />
            <TextareaField
              label="Section heading"
              value={form.servicesHomeHeading}
              disabled={locked}
              onChange={set("servicesHomeHeading")}
              rows={2}
              hint={`Heading above the service cards. Write {count} for the number of services spelled out, or {n} for digits — either one updates itself when you add or remove a service below. Right now {count} is "${countWord(form.servicesList ?? "")}".`}
            />
            <TextareaField
              label="Intro"
              value={form.servicesIntro}
              disabled={locked}
              onChange={set("servicesIntro")}
              rows={3}
              hint="The paragraph under the heading, above the cards — a short summary of what the company does."
            />
          </div>
        </Card>

        <Card title="Section display">
          <div className="grid gap-5 p-5 sm:grid-cols-2">
            <ToggleField
              label="Show this section"
              value={form.servicesVisible ?? "1"}
              disabled={locked}
              onChange={set("servicesVisible")}
              hint="Turn off to take the whole services section off the home page without deleting anything. The Services link in the top menu disappears with it."
            />
            <SelectField
              label="Cards per row"
              value={form.servicesColumns ?? "2"}
              disabled={locked}
              onChange={set("servicesColumns")}
              options={[
                { value: "2", label: "2 across — largest cards (default)" },
                { value: "3", label: "3 across" },
                { value: "4", label: "4 across (smallest cards)" },
              ]}
              hint={`On a wide screen. Tablets always show 2 and phones 1, whatever you pick. You have ${services.length} service${services.length === 1 ? "" : "s"} — if the last row comes up short, its cards sit centred rather than off to the left.`}
            />
            <SelectField
              label="Card image shape"
              value={form.servicesImageShape ?? "square"}
              disabled={locked}
              onChange={set("servicesImageShape")}
              options={[
                { value: "square", label: "Square" },
                { value: "landscape", label: "Landscape (4:3)" },
                { value: "wide", label: "Wide (16:9)" },
                { value: "portrait", label: "Portrait (3:4)" },
              ]}
              hint="Applies to every card. Images are cropped from the centre to fit, so check the cards after changing it."
            />
            <SelectField
              label="Section background"
              value={form.servicesBackground ?? "tint"}
              disabled={locked}
              onChange={set("servicesBackground")}
              options={[
                { value: "tint", label: "Blueprint tint (default)" },
                { value: "surface", label: "Plain white" },
                { value: "paper", label: "Off-white" },
                { value: "brand", label: "Light blue tint" },
              ]}
              hint="The band behind the whole section. All four follow light/dark mode, so text stays readable either way."
            />
            <SelectField
              label="Section spacing"
              value={form.servicesSpacing ?? "normal"}
              disabled={locked}
              onChange={set("servicesSpacing")}
              options={[
                { value: "compact", label: "Compact" },
                { value: "normal", label: "Normal (default)" },
                { value: "roomy", label: "Roomy" },
              ]}
              hint="How much empty space sits above and below the section."
            />
            <SelectField
              label="Heading size"
              value={form.servicesHeadingSize ?? "medium"}
              disabled={locked}
              onChange={set("servicesHeadingSize")}
              options={[
                { value: "small", label: "Small" },
                { value: "medium", label: "Medium (default)" },
                { value: "large", label: "Large" },
              ]}
              hint="The size of the section heading only — the card titles are unaffected."
            />
            <SelectField
              label="Text alignment"
              value={form.servicesAlign ?? "left"}
              disabled={locked}
              onChange={set("servicesAlign")}
              options={[
                { value: "left", label: "Left (default)" },
                { value: "center", label: "Centred" },
              ]}
              hint="Moves the eyebrow, heading, intro and the card text together, so the section stays consistent."
            />
            <ToggleField
              label="Amber accent bar"
              value={form.servicesAccentBar ?? "1"}
              disabled={locked}
              onChange={set("servicesAccentBar")}
              hint="The short amber bar above the eyebrow. Other sections of the site use it too, so turning it off here makes this section the odd one out."
            />
            <ToggleField
              label="Fade-in animation"
              value={form.servicesAnimate ?? "1"}
              disabled={locked}
              onChange={set("servicesAnimate")}
              hint="Cards fade and slide up as the visitor scrolls to them. Turn off to have everything simply appear."
            />
            <ToggleField
              label="Zoom image on hover"
              value={form.servicesImageZoom ?? "1"}
              disabled={locked}
              onChange={set("servicesImageZoom")}
              hint="A slight zoom when the mouse is over a card image. Has no effect on phones and tablets."
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
              hint={'One service per line, written as "Title | description". Card images are added below — the image path that appears at the end of a line is managed for you.'}
            />

            {/* Parsed preview: makes a mistyped separator obvious before saving,
                and is where each card's image is set. */}
            <div>
              <p className="font-mono text-[11px] uppercase tracking-label text-accent-700">
                Cards &amp; images
              </p>
              {services.length === 0 ? (
                <p className="mt-2 text-sm text-concrete-400">
                  No services yet. Add one per line above — the home page section is hidden while this
                  list is empty.
                </p>
              ) : (
                <ol className="mt-2 divide-y divide-concrete-100 rounded-md border border-concrete-200">
                  {services.map((s, i) => (
                    <li key={`${s.slug}-${i}`}>
                      <DropTarget
                        onFiles={(files) => uploadImage(i, files[0])}
                        multiple={false}
                        disabled={locked || uploading !== null}
                        className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center"
                      >
                        <span className="font-mono text-xs text-concrete-400">{i + 1}</span>

                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-concrete-200 bg-concrete-50">
                          {s.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={getStorageUrl(s.image)} alt={s.title} className="h-full w-full object-cover" />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center px-1 text-center font-mono text-[10px] leading-tight text-concrete-400">
                              {locked ? "no image" : "drop image here"}
                            </span>
                          )}
                          {uploading === i && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                              <Spinner className="h-5 w-5" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="font-display text-sm font-semibold text-ink">{s.title}</div>
                          {s.desc ? (
                            <div className="mt-0.5 text-sm text-concrete-500">{s.desc}</div>
                          ) : (
                            <div className="mt-0.5 text-sm text-amber-700">
                              No description — add one after a “|” on this line.
                            </div>
                          )}
                        </div>

                        {!locked && (
                          <div className="flex shrink-0 items-center gap-2">
                            <PrimaryBtn
                              onClick={() => {
                                targetRow.current = i;
                                fileRef.current?.click();
                              }}
                            >
                              {s.image ? "Replace" : "Add image"}
                            </PrimaryBtn>
                            {s.image && (
                              <button
                                type="button"
                                onClick={() => clearImage(i)}
                                className="rounded-md border border-concrete-200 px-3 py-1.5 font-display text-xs font-semibold text-concrete-600 hover:bg-concrete-50"
                              >
                                Clear image
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeService(i)}
                              title="Delete this service entirely"
                              className="rounded-md border border-red-200 px-3 py-1.5 font-display text-xs font-semibold text-red-700 hover:bg-red-50"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </DropTarget>
                    </li>
                  ))}
                </ol>
              )}
              <p className="mt-2 text-xs text-concrete-400">
                Square images look best — anything else is cropped to a square. You can drag an image
                straight onto a row instead of clicking. A card with no image shows its title on a
                striped placeholder instead. Uploads happen right away, but only reach the site once
                you click <strong>Save changes</strong>.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {!locked && <SaveBar onSave={handleSave} saving={saving} saved={saved} error={error} />}
    </>
  );
}
