"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { PERMS, type Project, type ProjectPhoto } from "@/lib/admin";
import { Card, Pill, Modal, Field, inputCls, Spinner } from "../ui";
import { getStorageUrl } from "@/lib/storage-url";

const PROJECT_TYPES = ["", "New Construction", "Renovation", "Retrofit", "Restoration", "Interior Fit-out", "Addition", "Demolition"];
const CONTRACT_TYPES = ["", "General Contracting", "Construction Management", "Prime Contractor", "Design-Build", "Cost-Plus", "Project Management", "Private"];

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 py-3">
      <dt className="text-sm text-concrete-500">{k}</dt>
      <dd className="text-right font-display text-sm font-semibold text-ink">{v}</dd>
    </div>
  );
}

export default function ProjectDetailView({ id }: { id: string }) {
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [denied, setDenied] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", location: "", type: "", dateCompleted: "", owner: "",
    architect: "", contractType: "", value: "", grossFloorArea: "", description: "",
  });
  const [saving, setSaving] = useState(false);

  const [photos, setPhotos] = useState<ProjectPhoto[]>([]);
  const [uploading, setUploading] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [genResult, setGenResult] = useState<
    { ok: true; title: string; docsUsed: number; warnings: string[] } | { ok: false; error: string } | null
  >(null);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/projects/${id}?userId=${user.id}`)
      .then((r) => { if (r.status === 404) { setDenied(true); return null; } return r.json(); })
      .then((data) => { if (data) { setProject(data); setPhotos(data.photos ?? []); } });
  }, [user, id]);

  if (!user) return null;
  if (denied) return null;
  if (!project) return null;

  const perms = PERMS[user.role];
  const x = project;
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const openEdit = () => {
    setForm({
      name: x.name, location: x.location, type: x.type, dateCompleted: x.dateCompleted,
      owner: x.owner, architect: x.architect, contractType: x.contractType,
      value: x.value ? String(x.value) : "", grossFloorArea: x.grossFloorArea,
      description: x.description,
    });
    setEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const updated = await res.json();
    setProject((prev) => prev ? { ...prev, ...updated } : prev);
    setEditOpen(false);
    setSaving(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    if (user?.id) fd.append("userId", user.id);
    const res = await fetch(`/api/projects/${id}/photos`, { method: "POST", body: fd });
    if (res.ok) {
      const photo = await res.json();
      setPhotos((prev) => [...prev, photo]);
    } else {
      alert("Upload failed. Please try again.");
    }
    e.target.value = "";
    setUploading(false);
  };

  const handleDeletePhoto = async (photoId: number) => {
    if (!confirm("Delete this photo?")) return;
    await fetch(`/api/projects/${id}/photos/${photoId}`, { method: "DELETE" });
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  const handleGenerateArticle = async () => {
    if (generating) return;
    setGenResult(null);
    setGenerating(true);
    try {
      const res = await fetch(`/api/projects/${id}/generate-article`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setGenResult({ ok: true, title: data.title, docsUsed: data.docsUsed ?? 0, warnings: data.warnings ?? [] });
      } else {
        setGenResult({ ok: false, error: data.error ?? "Blog generation failed. Please try again." });
      }
    } catch {
      setGenResult({ ok: false, error: "Network error. Please try again." });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/projects" className="font-mono text-xs text-concrete-500 hover:text-brand-700">
          ← All projects
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h2 className="font-display text-2xl font-black tracking-tight text-ink">{x.name}</h2>
          {x.type && <Pill text={x.type} />}
          <div className="ml-auto flex items-center gap-2">
            {perms.manageNews && (
              <button
                onClick={handleGenerateArticle}
                disabled={generating}
                title="Draft a blog post from this project's details, photos and documents"
                className="flex items-center gap-1.5 rounded-md bg-brand-700 px-3 py-1.5 font-display text-xs font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
              >
                {generating ? (
                  <Spinner className="h-3.5 w-3.5" />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                    <path d="M12 3a3 3 0 0 1 3 3v1a3 3 0 0 1 3 3 3 3 0 0 1 0 6 3 3 0 0 1-3 3v-1a3 3 0 0 1-6 0v1a3 3 0 0 1-3-3 3 3 0 0 1 0-6 3 3 0 0 1 3-3V6a3 3 0 0 1 3-3z" />
                  </svg>
                )}
                {generating ? "Generating…" : "Generate blog post"}
              </button>
            )}
            {perms.editProjects && (
              <button
                onClick={openEdit}
                className="rounded-md border border-concrete-200 bg-white px-3 py-1.5 font-display text-xs font-semibold text-ink hover:bg-concrete-50"
              >
                Edit project
              </button>
            )}
          </div>
        </div>
        <p className="mt-1 font-mono text-xs text-concrete-500">
          {x.location}{x.dateCompleted ? ` · Completed ${x.dateCompleted.slice(0, 4)}` : ""}
        </p>
      </div>

      {/* Blog generation result */}
      {genResult && (
        genResult.ok ? (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-display text-sm font-bold text-emerald-800">Draft created</p>
                <p className="mt-1 text-sm text-emerald-700">
                  &ldquo;{genResult.title}&rdquo; was saved as a draft
                  {genResult.docsUsed > 0 ? ` (using ${genResult.docsUsed} document${genResult.docsUsed === 1 ? "" : "s"})` : ""}.
                  Review and publish it in News &amp; Blog. You can generate a matching LinkedIn post there from the article&rsquo;s LinkedIn button.
                </p>
                {genResult.warnings.length > 0 && (
                  <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs text-emerald-700/80">
                    {genResult.warnings.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link href="/admin/news" className="rounded-md bg-emerald-700 px-3 py-1.5 font-display text-xs font-semibold text-white hover:bg-emerald-800">
                  Open in News &amp; Blog →
                </Link>
                <button onClick={() => setGenResult(null)} className="rounded-md p-1.5 text-emerald-600 hover:bg-emerald-100" aria-label="Dismiss">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
            <div>
              <p className="font-display text-sm font-bold text-red-700">Couldn&rsquo;t generate a post</p>
              <p className="mt-1 text-sm text-red-600">{genResult.error}</p>
            </div>
            <button onClick={() => setGenResult(null)} className="shrink-0 rounded-md p-1.5 text-red-500 hover:bg-red-100" aria-label="Dismiss">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </div>
        )
      )}

      {/* Description */}
      {x.description && (
        <div className="mb-6 rounded-xl border border-concrete-200 bg-white px-6 py-5">
          <p className="font-body text-base leading-relaxed text-concrete-600">{x.description}</p>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="min-w-0 space-y-6 xl:col-span-2">

          {/* Photos */}
          <section className="rounded-xl border border-concrete-200 bg-white">
            <div className="flex items-center justify-between border-b border-concrete-200 px-5 py-4">
              <h2 className="font-display text-sm font-bold tracking-tight text-ink">
                Photos <span className="ml-1 font-mono text-xs font-normal text-concrete-400">({photos.length})</span>
              </h2>
              {perms.editProjects && (
                <label className={`flex cursor-pointer items-center gap-1.5 rounded-md border border-concrete-200 px-3 py-1 font-display text-xs font-semibold text-ink hover:bg-concrete-50 ${uploading ? "pointer-events-none opacity-60" : ""}`}>
                  {uploading && <Spinner className="h-3 w-3" />}
                  {uploading ? "Uploading…" : "Upload photo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleUpload}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
            {photos.length === 0 ? (
              <p className="px-5 py-6 text-sm text-concrete-400">No photos yet. Upload some to show on the public website.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3">
                {photos.map((ph) => (
                  <div key={ph.id} className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-concrete-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={getStorageUrl(ph.path)} alt="" className="h-full w-full object-cover" />
                    {perms.editProjects && (
                      <button
                        onClick={() => handleDeletePhoto(ph.id)}
                        className="absolute right-2 top-2 hidden rounded-full bg-black/60 p-1.5 text-white group-hover:block hover:bg-black/80"
                        title="Delete photo"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5">
                          <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div>
          <Card title="Key facts">
            <dl className="divide-y divide-concrete-100 px-5">
              {x.location && <Fact k="Location" v={x.location} />}
              {x.type && <Fact k="Type" v={x.type} />}
              {x.contractType && <Fact k="Contract type" v={x.contractType} />}
              {x.value > 0 && <Fact k="Contract value" v={"$" + x.value.toLocaleString("en-US")} />}
              {x.owner && <Fact k="Owner" v={x.owner} />}
              {x.architect && <Fact k="Architect" v={x.architect} />}
              {x.grossFloorArea && <Fact k="Gross floor area" v={x.grossFloorArea} />}
              {x.dateCompleted && <Fact k="Year completed" v={x.dateCompleted.slice(0, 4)} />}
            </dl>
          </Card>
        </div>
      </div>

      {/* Edit modal */}
      {editOpen && (
        <Modal title="Edit project" onClose={() => setEditOpen(false)}>
          <form onSubmit={handleEdit} className="space-y-4">
            <Field label="Project name">
              <input required className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Location">
                <input className={inputCls} value={form.location} onChange={(e) => set("location", e.target.value)} />
              </Field>
              <Field label="Type">
                <select className={inputCls} value={form.type} onChange={(e) => set("type", e.target.value)}>
                  {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t || "Select type…"}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Owner">
                <input className={inputCls} value={form.owner} onChange={(e) => set("owner", e.target.value)} placeholder="e.g. City of Toronto" />
              </Field>
              <Field label="Architect">
                <input className={inputCls} value={form.architect} onChange={(e) => set("architect", e.target.value)} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Contract type">
                <select className={inputCls} value={form.contractType} onChange={(e) => set("contractType", e.target.value)}>
                  {CONTRACT_TYPES.map((t) => <option key={t} value={t}>{t || "Select contract…"}</option>)}
                </select>
              </Field>
              <Field label="Contract value ($)">
                <input type="number" min="0" className={inputCls} value={form.value} onChange={(e) => set("value", e.target.value)} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Gross floor area">
                <input className={inputCls} value={form.grossFloorArea} onChange={(e) => set("grossFloorArea", e.target.value)} placeholder="e.g. 12,500 sq ft" />
              </Field>
              <Field label="Year completed">
                <input type="number" min="1900" max="2100" placeholder="e.g. 2023" className={inputCls} value={form.dateCompleted} onChange={(e) => set("dateCompleted", e.target.value)} />
              </Field>
            </div>
            <Field label="Description">
              <textarea rows={3} className={inputCls} value={form.description} onChange={(e) => set("description", e.target.value)} />
            </Field>
            <div className="flex justify-end gap-2 border-t border-concrete-100 pt-4">
              <button type="button" onClick={() => setEditOpen(false)} className="rounded-md px-4 py-2 text-sm font-medium text-concrete-600 hover:text-ink">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="rounded-md bg-brand-700 px-4 py-2 font-display text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50">
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
