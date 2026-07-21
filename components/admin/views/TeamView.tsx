"use client";

import { useState, useEffect, useRef } from "react";
import { getStorageUrl } from "@/lib/storage-url";
import { StatCard, Card, PrimaryBtn, Modal, Field, inputCls, Spinner } from "../ui";
import type { AboutContent } from "@/lib/about-content";

type Member = { id: string; order: number; name: string; title: string; bio: string; photo: string };

const TITLES = [
  "President",
  "Vice President",
  "Chief Executive Officer",
  "Chief Operating Officer",
  "Chief Financial Officer",
  "Director of Operations",
  "Project Director",
] as const;

const BLANK = { name: "", title: TITLES[0] as string, bio: "" };

export default function TeamView() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [modalPhoto, setModalPhoto] = useState<{ file: File; preview: string } | null>(null);
  const [photoUploading, setPhotoUploading] = useState<string | null>(null);
  const [groupPhoto, setGroupPhoto] = useState("");
  const [groupUploading, setGroupUploading] = useState(false);

  // Editable About-page content
  const [about, setAbout] = useState<AboutContent | null>(null);
  const [aboutImage, setAboutImage] = useState("");
  const [aboutSaving, setAboutSaving] = useState(false);
  const [aboutImageUploading, setAboutImageUploading] = useState(false);
  const aboutImageRef = useRef<HTMLInputElement>(null);

  const modalPhotoRef = useRef<HTMLInputElement>(null);
  const photoInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const groupPhotoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/team").then((r) => r.json()).catch(() => []),
      fetch("/api/team/group-photo").then((r) => r.json()).catch(() => ({ photo: "" })),
      fetch("/api/about").then((r) => r.json()).catch(() => null),
    ]).then(([membersData, groupData, aboutData]) => {
      setMembers(Array.isArray(membersData) ? membersData : []);
      setGroupPhoto(groupData?.photo ?? "");
      if (aboutData) {
        setAbout(aboutData.content);
        setAboutImage(aboutData.image ?? "");
      }
      setLoading(false);
    });
  }, []);

  const setAboutField = (k: keyof AboutContent, v: string) =>
    setAbout((a) => (a ? { ...a, [k]: v } : a));

  const saveAbout = async () => {
    if (!about) return;
    setAboutSaving(true);
    try {
      await fetch("/api/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(about),
      });
    } finally {
      setAboutSaving(false);
    }
  };

  const uploadAboutImage = async (file: File) => {
    setAboutImageUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/about/image", { method: "POST", body: fd });
    const { image } = await res.json();
    setAboutImage(image);
    setAboutImageUploading(false);
  };

  const deleteAboutImage = async () => {
    await fetch("/api/about/image", { method: "DELETE" });
    setAboutImage("");
  };

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const openCreate = () => { setForm(BLANK); setModalPhoto(null); setEditingId(null); setSaving(false); setOpen(true); };
  const openEdit = (m: Member) => { setForm({ name: m.name, title: m.title, bio: m.bio }); setModalPhoto(null); setEditingId(m.id); setSaving(false); setOpen(true); };
  const closeModal = () => { setOpen(false); setEditingId(null); setForm(BLANK); setModalPhoto(null); setSaving(false); };

  const pickModalPhoto = (file: File) => {
    const preview = URL.createObjectURL(file);
    setModalPhoto({ file, preview });
  };

  const uploadPhoto = async (id: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/api/team/${id}/photo`, { method: "POST", body: fd });
    const { photo } = await res.json();
    return photo as string;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const res = await fetch(`/api/team/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        let updated = await res.json();
        if (modalPhoto) {
          const photo = await uploadPhoto(editingId, modalPhoto.file);
          updated = { ...updated, photo };
        }
        setMembers((ms) => ms.map((m) => (m.id === editingId ? { ...m, ...updated } : m)));
      } else {
        const res = await fetch("/api/team", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        let created = await res.json();
        if (modalPhoto) {
          const photo = await uploadPhoto(created.id, modalPhoto.file);
          created = { ...created, photo };
        }
        setMembers((ms) => [...ms, created]);
      }
      closeModal();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this team member?")) return;
    await fetch(`/api/team/${id}`, { method: "DELETE" });
    setMembers((ms) => ms.filter((m) => m.id !== id));
  };

  const moveOrder = async (id: string, dir: -1 | 1) => {
    const idx = members.findIndex((m) => m.id === id);
    const target = members[idx + dir];
    if (!target) return;
    const a = members[idx];
    const newOrderA = target.order;
    const newOrderB = a.order;
    setMembers((ms) =>
      ms.map((m) => m.id === a.id ? { ...m, order: newOrderA } : m.id === target.id ? { ...m, order: newOrderB } : m)
         .sort((x, y) => x.order - y.order)
    );
    await Promise.all([
      fetch(`/api/team/${a.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order: newOrderA }) }),
      fetch(`/api/team/${target.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order: newOrderB }) }),
    ]);
  };

  const handlePhotoUpload = async (id: string, file: File) => {
    setPhotoUploading(id);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/api/team/${id}/photo`, { method: "POST", body: fd });
    const { photo } = await res.json();
    setMembers((ms) => ms.map((m) => (m.id === id ? { ...m, photo } : m)));
    setPhotoUploading(null);
  };

  const handlePhotoDelete = async (id: string) => {
    await fetch(`/api/team/${id}/photo`, { method: "DELETE" });
    setMembers((ms) => ms.map((m) => (m.id === id ? { ...m, photo: "" } : m)));
  };

  const handleGroupUpload = async (file: File) => {
    setGroupUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/team/group-photo", { method: "POST", body: fd });
    const { photo } = await res.json();
    setGroupPhoto(photo);
    setGroupUploading(false);
  };

  const handleGroupDelete = async () => {
    await fetch("/api/team/group-photo", { method: "DELETE" });
    setGroupPhoto("");
  };

  return (
    <>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Leaders" value={loading ? "—" : members.length} hint="shown on About page" />
        <StatCard label="Team photo" value={groupPhoto ? "Uploaded" : "None"} hint={groupPhoto ? "live on site" : "not yet uploaded"} />
        <StatCard label="About page" value="Live" hint="updates in real time" />
      </div>

      <div className="space-y-6">
        {/* Editable About-page content */}
        <Card
          title="About page content"
          right={<PrimaryBtn onClick={saveAbout}>{aboutSaving ? "Saving…" : "Save content"}</PrimaryBtn>}
        >
          <div className="space-y-5 p-6">
            {!about ? (
              <div className="flex justify-center py-8"><Spinner className="h-6 w-6" /></div>
            ) : (
              <>
                <Field label="Who we are">
                  <textarea rows={4} className={inputCls} value={about.whoWeAre} onChange={(e) => setAboutField("whoWeAre", e.target.value)} />
                </Field>
                <Field label="Where we are">
                  <textarea rows={3} className={inputCls} value={about.whereWeAre} onChange={(e) => setAboutField("whereWeAre", e.target.value)} />
                </Field>
                <Field label="What we do (leave a blank line between paragraphs)">
                  <textarea rows={9} className={inputCls} value={about.whatWeDo} onChange={(e) => setAboutField("whatWeDo", e.target.value)} />
                </Field>
                <Field label="Pegah Construction Ltd. will (one bullet per line)">
                  <textarea rows={5} className={inputCls} value={about.pegahWill} onChange={(e) => setAboutField("pegahWill", e.target.value)} />
                </Field>
                <Field label="Closing statement">
                  <textarea rows={3} className={inputCls} value={about.closing} onChange={(e) => setAboutField("closing", e.target.value)} />
                </Field>

                {/* "What we do" image */}
                <div>
                  <span className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-wide text-concrete-500">
                    "What we do" image
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={aboutImageRef}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAboutImage(f); e.target.value = ""; }}
                  />
                  <div className="flex items-start gap-4">
                    <div className="relative h-28 w-40 shrink-0 overflow-hidden rounded-lg border border-concrete-200 bg-concrete-50">
                      {aboutImage ? (
                        <img src={getStorageUrl(aboutImage)} alt="About" className="h-full w-full object-cover" />
                      ) : (
                        <img src="/about.jpg" alt="About (default)" className="h-full w-full object-cover opacity-70" />
                      )}
                      {aboutImageUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/60"><Spinner className="h-6 w-6" /></div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <PrimaryBtn onClick={() => aboutImageRef.current?.click()}>
                        {aboutImageUploading ? "Uploading…" : aboutImage ? "Replace image" : "Upload image"}
                      </PrimaryBtn>
                      {aboutImage && (
                        <button type="button" onClick={deleteAboutImage}
                          className="rounded-md border border-concrete-200 px-3 py-1.5 font-display text-xs font-semibold text-concrete-600 hover:bg-concrete-50">
                          Reset to default
                        </button>
                      )}
                      <p className="max-w-[16rem] text-xs text-concrete-400">Shown beside the “What we do” text on the About page.</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>

        <Card title="Leadership" right={<PrimaryBtn onClick={openCreate}>+ Add member</PrimaryBtn>}>
          {loading ? (
            <div className="flex justify-center py-16"><Spinner className="h-6 w-6" /></div>
          ) : members.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-concrete-400">No leaders yet. Add the President, Vice President, or other executives.</p>
            </div>
          ) : (
            <div className="grid gap-6 p-6 sm:grid-cols-2 xl:grid-cols-3">
              {members.map((m) => (
                <div key={m.id} className="overflow-hidden rounded-xl border border-concrete-200 bg-white">
                  {/* Photo — click to upload */}
                  <div
                    className="group relative aspect-[4/5] w-full cursor-pointer bg-concrete-100"
                    onClick={() => photoInputRefs.current[m.id]?.click()}
                  >
                    {m.photo ? (
                      <img src={getStorageUrl(m.photo)} alt={m.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-concrete-300">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="h-16 w-16">
                          <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                        </svg>
                        <span className="font-mono text-xs">Click to upload photo</span>
                      </div>
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" className="h-8 w-8">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                      <span className="font-mono text-xs text-white">{m.photo ? "Replace photo" : "Upload photo"}</span>
                    </div>
                    {photoUploading === m.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Spinner className="h-8 w-8 text-white" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={(el) => { photoInputRefs.current[m.id] = el; }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePhotoUpload(m.id, file);
                        e.target.value = "";
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="font-display text-base font-bold text-ink">{m.name || <span className="text-concrete-300">No name</span>}</div>
                    <div className="mt-0.5 font-mono text-[11px] uppercase tracking-label text-brand-700">{m.title}</div>
                    {m.bio && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-concrete-500">{m.bio}</p>}
                    <div className="mt-4 flex items-center gap-2 border-t border-concrete-100 pt-3">
                      {/* Priority arrows */}
                      <button type="button" onClick={() => moveOrder(m.id, -1)}
                        disabled={members.indexOf(m) === 0}
                        className="rounded border border-concrete-200 p-1 text-concrete-400 hover:text-ink disabled:opacity-30"
                        title="Move up">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3"><path d="M18 15l-6-6-6 6"/></svg>
                      </button>
                      <button type="button" onClick={() => moveOrder(m.id, 1)}
                        disabled={members.indexOf(m) === members.length - 1}
                        className="rounded border border-concrete-200 p-1 text-concrete-400 hover:text-ink disabled:opacity-30"
                        title="Move down">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3"><path d="M6 9l6 6 6-6"/></svg>
                      </button>
                      <button type="button" onClick={() => openEdit(m)}
                        className="ml-1 font-display text-xs font-semibold text-concrete-500 hover:text-ink">
                        Edit info
                      </button>
                      {m.photo && (
                        <button type="button" onClick={() => handlePhotoDelete(m.id)}
                          className="font-display text-xs font-semibold text-concrete-400 hover:text-concrete-600">
                          Remove photo
                        </button>
                      )}
                      <button type="button" onClick={() => handleDelete(m.id)}
                        className="ml-auto font-display text-xs font-semibold text-red-500 hover:text-red-700">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Team group photo */}
        <Card title="Team photo" right={
          <div className="flex gap-2">
            <input type="file" accept="image/*" className="hidden" ref={groupPhotoRef}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleGroupUpload(f); e.target.value = ""; }}
            />
            <PrimaryBtn onClick={() => groupPhotoRef.current?.click()}>
              {groupUploading ? "Uploading…" : groupPhoto ? "Replace" : "Upload photo"}
            </PrimaryBtn>
            {groupPhoto && (
              <button type="button" onClick={handleGroupDelete}
                className="rounded-md border border-concrete-200 px-3 py-1.5 font-display text-xs font-semibold text-concrete-600 hover:bg-concrete-50">
                Remove
              </button>
            )}
          </div>
        }>
          <div className="p-6">
            <p className="mb-4 text-sm text-concrete-500">Wide banner shown in the "Our team" section on the About page.</p>
            <div className="relative overflow-hidden rounded-xl border border-concrete-200 bg-concrete-50" style={{ aspectRatio: "21/9" }}>
              {groupPhoto ? (
                <img src={getStorageUrl(groupPhoto)} alt="Team photo" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-concrete-300">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="h-10 w-10">
                    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
                  </svg>
                  <span className="font-mono text-xs">No team photo uploaded</span>
                </div>
              )}
              {groupUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                  <Spinner className="h-8 w-8" />
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {open && (
        <Modal title={editingId ? "Edit member" : "Add member"} onClose={closeModal}>
          <form onSubmit={handleSave} className="space-y-4">
            {/* Photo picker — plain div, NOT Field, to avoid double-trigger from label wrapping */}
            <div>
              <span className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-wide text-concrete-500">Photo</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={modalPhotoRef}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) pickModalPhoto(f); e.target.value = ""; }}
              />
              <div
                className="group relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-concrete-200 bg-concrete-50 transition-colors hover:border-brand-400 hover:bg-brand-50"
                style={{ aspectRatio: "4/3" }}
                onClick={() => modalPhotoRef.current?.click()}
              >
                {modalPhoto ? (
                  <img src={modalPhoto.preview} alt="Preview" className="h-full w-full object-cover" />
                ) : editingId && members.find((m) => m.id === editingId)?.photo ? (
                  <img src={getStorageUrl(members.find((m) => m.id === editingId)!.photo)} alt="Current" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-concrete-400 group-hover:text-brand-600">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-10 w-10">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    <span className="font-mono text-xs">Click to upload photo</span>
                  </div>
                )}
                {(modalPhoto || (editingId && members.find((m) => m.id === editingId)?.photo)) && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" className="h-7 w-7">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    <span className="font-mono text-xs text-white">Replace photo</span>
                  </div>
                )}
              </div>
            </div>

            <Field label="Name">
              <input required className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. John Smith" />
            </Field>
            <Field label="Title">
              <select required className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)}>
                {TITLES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Bio">
              <textarea rows={3} className={inputCls} value={form.bio} onChange={(e) => set("bio", e.target.value)}
                placeholder="Short biography shown on the About page…" />
            </Field>
            <div className="flex items-center justify-between gap-2 pt-2">
              {editingId ? (
                <button
                  type="button"
                  disabled={saving}
                  onClick={async () => { if (!confirm("Delete this team member?")) return; closeModal(); await fetch(`/api/team/${editingId}`, { method: "DELETE" }); setMembers((ms) => ms.filter((m) => m.id !== editingId)); }}
                  className="rounded-md border border-red-200 px-3 py-2 font-display text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Delete member
                </button>
              ) : <span />}
              <div className="flex gap-2">
                <button type="button" onClick={closeModal} className="rounded-md px-4 py-2 text-sm font-medium text-concrete-600 hover:text-ink">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="rounded-md bg-brand-700 px-4 py-2 font-display text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50">
                  {saving ? "Saving…" : editingId ? "Save changes" : "Add member"}
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
