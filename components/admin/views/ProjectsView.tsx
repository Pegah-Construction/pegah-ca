"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { PERMS, money, type Project, type ProjectPhoto } from "@/lib/admin";
import { Card, THead, Table, Pill, PrimaryBtn, Modal, Field, inputCls, SearchInput, Spinner } from "../ui";
import { getStorageUrl } from "@/lib/storage-url";

const CATEGORIES = ["", "Commercial", "Residential"];
const PURPOSE_TYPES = ["", "Education", "Emergency Services", "Retail", "Recreation", "Transportation", "Other"];
const CONSTRUCTION_TYPES = ["", "New Construction", "Renovation", "Retrofit", "Restoration", "Interior Fit-out", "Addition", "Demolition"];
const CONTRACT_TYPES = ["", "General Contracting", "Construction Management", "Prime Contractor", "Design-Build", "Project Management", "Private"];

const empty = () => ({
  name: "", location: "",
  category: "", type: "", constructionType: "", dateCompleted: "", owner: "", architect: "",
  contractType: "", value: "", grossFloorArea: "", description: "",
});

export default function ProjectsView() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [q, setQ] = useState("");

  // Staged photos for new-project create flow
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Live photos for edit flow
  const [editPhotos, setEditPhotos] = useState<ProjectPhoto[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/projects?userId=${user.id}`).then((r) => r.json()).then(setProjects);
  }, [user]);

  const resetPhotos = () => {
    previews.forEach((url) => URL.revokeObjectURL(url));
    setPendingFiles([]);
    setPreviews([]);
  };

  const openCreate = () => {
    setForm(empty());
    setEditingId(null);
    resetPhotos();
    setOpen(true);
  };

  const openEdit = (p: Project) => {
    setForm({
      name: p.name, location: p.location,
      category: p.category ?? "", type: p.type, constructionType: p.constructionType ?? "", dateCompleted: p.dateCompleted, owner: p.owner,
      architect: p.architect, contractType: p.contractType,
      value: p.value ? String(p.value) : "", grossFloorArea: p.grossFloorArea,
      description: p.description,
    });
    setEditPhotos(p.photos ?? []);
    setEditingId(p.id);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    resetPhotos();
  };

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleUploadEditPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length || !editingId) return;
    setUploadingPhoto(true);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        if (user?.id) fd.append("userId", user.id);
        const res = await fetch(`/api/projects/${editingId}/photos`, { method: "POST", body: fd });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          alert(data.error ?? "Upload failed. Please try again.");
          break;
        }
        const photo = await res.json();
        setEditPhotos((prev) => [...prev, photo]);
      }
    } finally {
      e.target.value = "";
      setUploadingPhoto(false);
    }
  };

  const handleDeleteEditPhoto = async (photoId: number) => {
    if (!editingId) return;
    const res = await fetch(`/api/projects/${editingId}/photos/${photoId}`, { method: "DELETE" });
    if (!res.ok) {
      alert("Could not delete the photo. Please try again.");
      return;
    }
    setEditPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  const addFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setPendingFiles((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...newPreviews]);
    e.target.value = "";
  };

  const removeFile = (i: number) => {
    URL.revokeObjectURL(previews[i]);
    setPendingFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (editingId) {
      const res = await fetch(`/api/projects/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const updated = await res.json();
      setProjects((prev) => prev.map((p) => p.id === editingId ? { ...p, ...updated, photos: editPhotos } : p));
    } else {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, userId: user?.id }),
      });
      const created = await res.json();

      // Upload any staged photos now that we have the project ID
      if (pendingFiles.length > 0) {
        const uploaded: { id: number; path: string; order: number }[] = [];
        for (const file of pendingFiles) {
          const fd = new FormData();
          fd.append("file", file);
          const pr = await fetch(`/api/projects/${created.id}/photos`, { method: "POST", body: fd });
          uploaded.push(await pr.json());
        }
        created.photos = uploaded;
      }

      setProjects((prev) => [created, ...prev]);
    }
    closeModal();
    setSaving(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (deletingId) return;
    if (!confirm("Delete this project? All related data (photos, tasks, incidents) will be deleted too.")) return;
    setDeletingId(id);
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setDeletingId(null);
  };

  if (!user) return null;
  const perms = PERMS[user.role];

  const needle = q.trim().toLowerCase();
  const filtered = needle
    ? projects.filter((x) =>
        [x.name, x.location, x.type, x.contractType].some((v) => v.toLowerCase().includes(needle))
      )
    : projects;

  return (
    <>
      <Card title="All projects" right={
        <div className="flex items-center gap-3">
          <SearchInput value={q} onChange={setQ} placeholder="Search projects…" />
          {perms.editProjects && <PrimaryBtn onClick={openCreate}>+ New project</PrimaryBtn>}
        </div>
      }>
        <Table>
          <THead cols={["Project", "Type", "Contract", "Value", "Completed", ""]} />
          <tbody>
            {filtered.map((x) => (
              <tr key={x.id} className="border-b border-concrete-100 transition-colors last:border-0 hover:bg-brand-50/40">
                <td
                  className="cursor-pointer px-5 py-3"
                  onClick={() => (location.href = `/admin/projects/${x.id}`)}
                >
                  <div className="font-display font-semibold text-ink">{x.name}</div>
                  <div className="font-mono text-[11px] text-concrete-500">{x.location}</div>
                </td>
                <td className="px-5 py-3">{x.type ? <Pill text={x.type} /> : <span className="text-concrete-400">—</span>}</td>
                <td className="px-5 py-3 text-concrete-500">{x.contractType || "—"}</td>
                <td className="px-5 py-3 font-mono text-xs text-concrete-500">{x.value > 0 ? money(x.value) : "—"}</td>
                <td className="px-5 py-3 font-mono text-xs text-concrete-500">{x.dateCompleted ? x.dateCompleted.slice(0, 4) : "—"}</td>
                <td className="px-5 py-3 text-right">
                  {perms.editProjects && (
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); openEdit(x); }}
                        className="font-display text-xs font-semibold text-brand-700 hover:text-brand-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, x.id)}
                        disabled={!!deletingId}
                        className="font-display text-xs font-semibold text-red-600 transition-opacity hover:text-red-700 disabled:opacity-50"
                      >
                        {deletingId === x.id ? "…" : "Delete"}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      {open && (
        <Modal title={editingId ? "Edit project" : "New project"} onClose={closeModal}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Project name">
              <input
                required
                className={inputCls}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Riverside Office Tower"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Location">
                <input
                  className={inputCls}
                  value={form.location}
                  onChange={(e) => set("location", e.target.value)}
                  placeholder="e.g. Toronto, ON"
                />
              </Field>
              <Field label="Category">
                <select className={inputCls} value={form.category} onChange={(e) => set("category", e.target.value)}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c || "Select category…"}</option>)}
                </select>
              </Field>
              {form.category === "Commercial" && (
                <Field label="Purpose type">
                  <select className={inputCls} value={form.type} onChange={(e) => set("type", e.target.value)}>
                    {PURPOSE_TYPES.map((t) => <option key={t} value={t}>{t || "Select purpose…"}</option>)}
                  </select>
                </Field>
              )}
              <Field label="Construction type">
                <select className={inputCls} value={form.constructionType} onChange={(e) => set("constructionType", e.target.value)}>
                  {CONSTRUCTION_TYPES.map((t) => <option key={t} value={t}>{t || "Select construction type…"}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Owner">
                <input
                  className={inputCls}
                  value={form.owner}
                  onChange={(e) => set("owner", e.target.value)}
                  placeholder="e.g. City of Toronto"
                />
              </Field>
              <Field label="Architect">
                <input
                  className={inputCls}
                  value={form.architect}
                  onChange={(e) => set("architect", e.target.value)}
                  placeholder="e.g. Smith Architects Inc."
                />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Contract type">
                <select className={inputCls} value={form.contractType} onChange={(e) => set("contractType", e.target.value)}>
                  {CONTRACT_TYPES.map((t) => <option key={t} value={t}>{t || "Select contract…"}</option>)}
                </select>
              </Field>
              <Field label="Contract value ($)">
                <input
                  type="number"
                  min="0"
                  className={inputCls}
                  value={form.value}
                  onChange={(e) => set("value", e.target.value)}
                  placeholder="e.g. 5000000"
                />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Gross floor area">
                <input
                  className={inputCls}
                  value={form.grossFloorArea}
                  onChange={(e) => set("grossFloorArea", e.target.value)}
                  placeholder="e.g. 12,500 sq ft"
                />
              </Field>
              <Field label="Year completed">
                <input
                  type="number"
                  min="1900"
                  max="2100"
                  className={inputCls}
                  value={form.dateCompleted}
                  onChange={(e) => set("dateCompleted", e.target.value)}
                  placeholder="e.g. 2023"
                />
              </Field>
            </div>
            <Field label="Description">
              <textarea
                rows={3}
                className={inputCls}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Brief project description…"
              />
            </Field>

            {/* Photos — edit mode: real-time upload/delete */}
            {editingId && (
              <Field label="Photos">
                {editPhotos.length > 0 && (
                  <div className="mb-3 grid grid-cols-4 gap-2">
                    {editPhotos.map((ph) => (
                      <div key={ph.id} className="group relative aspect-square overflow-hidden rounded-lg bg-concrete-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={getStorageUrl(ph.path)} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleDeleteEditPhoto(ph.id)}
                          className="absolute right-1 top-1 hidden rounded-full bg-black/60 p-1 text-white group-hover:flex hover:bg-black/80"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3 w-3">
                            <path d="M18 6 6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <label className={`flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-concrete-300 px-4 py-3 text-sm text-concrete-500 hover:border-brand-400 hover:text-brand-700 ${uploadingPhoto ? "pointer-events-none opacity-60" : ""}`}>
                  {uploadingPhoto
                    ? <Spinner className="h-4 w-4 shrink-0" />
                    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 shrink-0">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                  }
                  {uploadingPhoto ? "Uploading…" : "Add photos"}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={handleUploadEditPhoto}
                    disabled={uploadingPhoto}
                  />
                </label>
              </Field>
            )}

            {/* Photos — only shown when creating */}
            {!editingId && (
              <Field label="Photos">
                <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-concrete-300 px-4 py-3 text-sm text-concrete-500 hover:border-brand-400 hover:text-brand-700">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 shrink-0">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  {pendingFiles.length === 0 ? "Click to add photos" : `${pendingFiles.length} photo${pendingFiles.length > 1 ? "s" : ""} selected — add more`}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={addFiles}
                  />
                </label>
                {previews.length > 0 && (
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {previews.map((src, i) => (
                      <div key={i} className="group relative aspect-square overflow-hidden rounded-lg bg-concrete-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="absolute right-1 top-1 hidden rounded-full bg-black/60 p-1 text-white group-hover:flex hover:bg-black/80"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3 w-3">
                            <path d="M18 6 6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Field>
            )}

            <div className="flex justify-end gap-2 border-t border-concrete-100 pt-4">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-md px-4 py-2 text-sm font-medium text-concrete-600 hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-brand-700 px-4 py-2 font-display text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50"
              >
                {saving
                  ? editingId
                    ? "Saving…"
                    : pendingFiles.length > 0
                      ? "Creating & uploading…"
                      : "Creating…"
                  : editingId
                    ? "Save changes"
                    : "Create project"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
