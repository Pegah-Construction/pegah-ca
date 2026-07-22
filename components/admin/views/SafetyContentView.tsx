"use client";

import { useState, useEffect, useRef } from "react";
import { getStorageUrl } from "@/lib/storage-url";
import { Card, Field, inputCls, PrimaryBtn, Spinner } from "../ui";
import type { SafetyContent } from "@/lib/safety-content";

export default function SafetyContentView() {
  const [content, setContent] = useState<SafetyContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedTick, setSavedTick] = useState(false);
  const [image, setImage] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/safety").then((r) => r.json()).then((d) => { setContent(d.content); setImage(d.image ?? ""); }).catch(() => {});
  }, []);

  const uploadImage = async (file: File) => {
    setImageUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/safety/image", { method: "POST", body: fd });
    const { image: img } = await res.json();
    setImage(img);
    setImageUploading(false);
  };

  const deleteImage = async () => {
    await fetch("/api/safety/image", { method: "DELETE" });
    setImage("");
  };

  const set = (k: keyof SafetyContent, v: string) => setContent((c) => (c ? { ...c, [k]: v } : c));

  const save = async () => {
    if (!content) return;
    setSaving(true);
    try {
      await fetch("/api/safety", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      setSavedTick(true);
      setTimeout(() => setSavedTick(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card
      title="Health & Safety page content"
      right={<PrimaryBtn onClick={save}>{saving ? "Saving…" : savedTick ? "Saved ✓" : "Save content"}</PrimaryBtn>}
    >
      {!content ? (
        <div className="flex justify-center py-16"><Spinner className="h-6 w-6" /></div>
      ) : (
        <div className="space-y-5 p-6">
          <p className="rounded-md bg-brand-50 px-4 py-2.5 text-xs text-brand-800">
            Edits publish to the public Health &amp; Safety page as soon as you save. Use{" "}
            <span className="font-mono">|</span> to separate the two parts on list lines (e.g. <span className="font-mono">Title | description</span>).
          </p>
          <Field label="Intro (hero paragraph)">
            <textarea rows={3} className={inputCls} value={content.intro} onChange={(e) => set("intro", e.target.value)} />
          </Field>

          {/* Intro image */}
          <div>
            <span className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-wide text-concrete-500">
              Intro image
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={imageRef}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.target.value = ""; }}
            />
            <div className="flex items-start gap-4">
              <div className="relative h-28 w-40 shrink-0 overflow-hidden rounded-lg border border-concrete-200 bg-concrete-50">
                {image ? (
                  <img src={getStorageUrl(image)} alt="Safety" className="h-full w-full object-cover" />
                ) : (
                  <img src="/health%20and%20safety.jpg" alt="Safety (default)" className="h-full w-full object-cover opacity-70" />
                )}
                {imageUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/60"><Spinner className="h-6 w-6" /></div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <PrimaryBtn onClick={() => imageRef.current?.click()}>
                  {imageUploading ? "Uploading…" : image ? "Replace image" : "Upload image"}
                </PrimaryBtn>
                {image && (
                  <button type="button" onClick={deleteImage}
                    className="rounded-md border border-concrete-200 px-3 py-1.5 font-display text-xs font-semibold text-concrete-600 hover:bg-concrete-50">
                    Reset to default
                  </button>
                )}
                <p className="max-w-[16rem] text-xs text-concrete-400">Shown beside the intro.</p>
              </div>
            </div>
          </div>
          <Field label="Stats — one per line, format: value | label">
            <textarea rows={4} className={`${inputCls} font-mono text-xs`} value={content.stats} onChange={(e) => set("stats", e.target.value)} />
          </Field>
          <Field label="Our HSE Commitment — leave a blank line between paragraphs">
            <textarea rows={6} className={inputCls} value={content.commitment} onChange={(e) => set("commitment", e.target.value)} />
          </Field>
          <Field label="Policy statement — one per line, format: Title | description">
            <textarea rows={7} className={`${inputCls} font-mono text-xs`} value={content.policy} onChange={(e) => set("policy", e.target.value)} />
          </Field>
          <Field label="Key duties as Constructor — one bullet per line">
            <textarea rows={8} className={inputCls} value={content.duties} onChange={(e) => set("duties", e.target.value)} />
          </Field>
          <Field label="Program evaluation — leave a blank line between paragraphs">
            <textarea rows={6} className={inputCls} value={content.programEval} onChange={(e) => set("programEval", e.target.value)} />
          </Field>
          <Field label="Certifications — one per line, format: Title | description">
            <textarea rows={5} className={`${inputCls} font-mono text-xs`} value={content.certifications} onChange={(e) => set("certifications", e.target.value)} />
          </Field>
          <Field label="Resources — one per line, format: Label | url">
            <textarea rows={7} className={`${inputCls} font-mono text-xs`} value={content.resources} onChange={(e) => set("resources", e.target.value)} />
          </Field>
        </div>
      )}
    </Card>
  );
}
