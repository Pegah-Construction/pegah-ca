"use client";

import { useState, useEffect, useRef } from "react";
import { getStorageUrl } from "@/lib/storage-url";
import { StatCard, Card, PrimaryBtn, Modal, Field, inputCls, Spinner, SearchInput } from "../ui";
import { TEAM_BIO_MAX, type AboutContent } from "@/lib/about-content";

type Member = { id: string; order: number; name: string; title: string; bio: string; photo: string; leadership: boolean };

const TITLES = [
  "President",
  "Vice President",
  "Chief Executive Officer",
  "Chief Operating Officer",
  "Chief Financial Officer",
  "Director of Operations",
  "Project Director",
] as const;

const BLANK = { name: "", title: TITLES[0] as string, bio: "", leadership: true };

export default function TeamView() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [modalPhoto, setModalPhoto] = useState<{ file: File; preview: string } | null>(null);
  const [photoUploading, setPhotoUploading] = useState<string | null>(null);
  const [q, setQ] = useState("");

  // Editable About-page content
  const [about, setAbout] = useState<AboutContent | null>(null);
  const [aboutImage, setAboutImage] = useState("");
  const [aboutSaving, setAboutSaving] = useState(false);
  const [aboutImageUploading, setAboutImageUploading] = useState(false);
  const aboutImageRef = useRef<HTMLInputElement>(null);

  const modalPhotoRef = useRef<HTMLInputElement>(null);
  const photoInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    Promise.all([
      fetch("/api/team").then((r) => r.json()).catch(() => []),
      fetch("/api/about").then((r) => r.json()).catch(() => null),
    ]).then(([membersData, aboutData]) => {
      setMembers(Array.isArray(membersData) ? membersData : []);
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

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  // Each section's "add" button preselects that section in the modal.
  const openCreate = (leadership: boolean) => { setForm({ ...BLANK, leadership }); setModalPhoto(null); setEditingId(null); setSaving(false); setOpen(true); };
  const openEdit = (m: Member) => { setForm({ name: m.name, title: m.title, bio: m.bio, leadership: m.leadership }); setModalPhoto(null); setEditingId(m.id); setSaving(false); setOpen(true); };
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
    // Reorder within the person's own section — swapping against someone in the
    // other section would move them between sections on the About page.
    const self = members.find((m) => m.id === id);
    if (!self) return;
    const section = members.filter((m) => m.leadership === self.leadership);
    const idx = section.findIndex((m) => m.id === id);
    const target = section[idx + dir];
    if (!target) return;
    const a = self;
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

  // Search is scoped to the team members list, where it lives — leadership is a
  // handful of people that fit on screen without filtering.
  const needle = q.trim().toLowerCase();
  const matches = (m: Member) =>
    !needle || [m.name, m.title, m.bio].some((v) => (v ?? "").toLowerCase().includes(needle));

  const leaders = members.filter((m) => m.leadership);
  const teamMembers = members.filter((m) => !m.leadership);
  const shownTeam = teamMembers.filter(matches);

  return (
    <>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Leaders" value={loading ? "—" : leaders.length} hint="shown on About page" />
        <StatCard label="Team members" value={loading ? "—" : teamMembers.length} hint="shown on About page" />
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

        {/* Both sections render the same card, so leadership and the wider team
            stay identical on the About page — individual photo, name, title, bio. */}
        {([
          {
            key: "leadership",
            title: "Leadership",
            list: leaders,
            total: leaders.length,
            // Few executives, so they keep the roomier card with the bio, and
            // there's nothing to search through.
            compact: false,
            searchable: false,
            empty: "No leaders yet. Add the President, CEO, Vice President, or other executives.",
          },
          {
            key: "team",
            title: "Team members",
            list: shownTeam,
            total: teamMembers.length,
            // The team can run long — denser cards so more fit on screen, and a
            // search box in this card's own header.
            compact: true,
            searchable: true,
            empty: "No team members yet. Everyone added here appears with their own photo in the “Our team” section.",
          },
        ] as const).map((section) => (
        <Card key={section.key}
          title={`${section.title}${section.total ? ` (${section.searchable && needle ? `${section.list.length} of ${section.total}` : section.total})` : ""}`}
          right={
            <div className="flex flex-wrap items-center gap-3">
              {section.searchable && (
                <SearchInput value={q} onChange={setQ} placeholder="Search team members…" />
              )}
              <PrimaryBtn onClick={() => openCreate(section.key === "leadership")}>+ Add member</PrimaryBtn>
            </div>
          }>
          {loading ? (
            <div className="flex justify-center py-16"><Spinner className="h-6 w-6" /></div>
          ) : section.list.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-concrete-400">
                {section.total === 0 ? section.empty : `No one in this section matches “${q.trim()}”.`}
              </p>
            </div>
          ) : (
            <div className={section.compact
              ? "grid gap-4 p-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6"
              : "grid gap-6 p-6 sm:grid-cols-2 xl:grid-cols-3"}>
              {section.list.map((m) => (
                <div key={m.id} className="overflow-hidden rounded-xl border border-concrete-200 bg-surface">
                  {/* Photo — click to upload */}
                  <div
                    className="group relative aspect-[4/5] w-full cursor-pointer bg-concrete-100"
                    onClick={() => photoInputRefs.current[m.id]?.click()}
                  >
                    {m.photo ? (
                      <img src={getStorageUrl(m.photo)} alt={m.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-concrete-300">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={section.compact ? "h-8 w-8" : "h-16 w-16"}>
                          <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                        </svg>
                        {!section.compact && <span className="font-mono text-xs">Click to upload photo</span>}
                      </div>
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" className={section.compact ? "h-5 w-5" : "h-8 w-8"}>
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                      {!section.compact && (
                        <span className="font-mono text-xs text-white">{m.photo ? "Replace photo" : "Upload photo"}</span>
                      )}
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
                  <div className={section.compact ? "p-3" : "p-4"}>
                    <div className={`font-display font-bold text-ink ${section.compact ? "truncate text-sm" : "text-base"}`}>
                      {m.name || <span className="text-concrete-300">No name</span>}
                    </div>
                    <div className="mt-0.5 truncate font-mono text-[11px] uppercase tracking-label text-accent-700">{m.title}</div>
                    {/* The bio is the tallest element — dropped from compact cards
                        so more people fit; it stays editable in the modal. */}
                    {m.bio && !section.compact && (
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-concrete-500">{m.bio}</p>
                    )}
                    <div className={`flex items-center gap-2 border-t border-concrete-100 ${section.compact ? "mt-2.5 pt-2" : "mt-4 pt-3"}`}>
                      {/* Reorder arrows hide only in the section being filtered:
                          its visible list is partial, so "up" would swap against
                          someone off-screen. */}
                      {!(section.searchable && needle) && (
                        <>
                          <button type="button" onClick={() => moveOrder(m.id, -1)}
                            disabled={section.list.indexOf(m) === 0}
                            className="rounded border border-concrete-200 p-1 text-concrete-400 hover:text-ink disabled:opacity-30"
                            title="Move up">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3"><path d="M18 15l-6-6-6 6"/></svg>
                          </button>
                          <button type="button" onClick={() => moveOrder(m.id, 1)}
                            disabled={section.list.indexOf(m) === section.list.length - 1}
                            className="rounded border border-concrete-200 p-1 text-concrete-400 hover:text-ink disabled:opacity-30"
                            title="Move down">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3"><path d="M6 9l6 6 6-6"/></svg>
                          </button>
                        </>
                      )}
                      <button type="button" onClick={() => openEdit(m)}
                        className={`font-display text-xs font-semibold text-concrete-500 hover:text-ink ${section.searchable && needle ? "" : "ml-1"}`}>
                        Edit
                      </button>
                      {m.photo && !section.compact && (
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
        ))}
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
            <Field label="Section">
              <select
                className={inputCls}
                value={form.leadership ? "leadership" : "team"}
                onChange={(e) => {
                  const isLeader = e.target.value === "leadership";
                  // Executive titles are a fixed list; team titles are free text.
                  // Swap to a sensible default so the field is never left holding
                  // a value the other section wouldn't offer.
                  setForm((f) => ({
                    ...f,
                    leadership: isLeader,
                    title: isLeader ? (TITLES.includes(f.title as typeof TITLES[number]) ? f.title : TITLES[0]) : f.title,
                  }));
                }}
              >
                <option value="leadership">Leadership</option>
                <option value="team">Team members</option>
              </select>
            </Field>
            <Field label="Title">
              {form.leadership ? (
                <select required className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)}>
                  {TITLES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              ) : (
                <input
                  required
                  className={inputCls}
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="e.g. Site Foreman, Estimator, Project Coordinator"
                />
              )}
            </Field>
            <Field label="Bio">
              <textarea
                rows={3}
                maxLength={TEAM_BIO_MAX}
                className={inputCls}
                value={form.bio}
                onChange={(e) => set("bio", e.target.value.slice(0, TEAM_BIO_MAX))}
                placeholder="Short biography shown on the About page — a sentence or two."
              />
              <div className="mt-1.5 flex justify-end">
                <span className={`font-mono text-[11px] ${
                  form.bio.length >= TEAM_BIO_MAX ? "text-amber-700" : "text-concrete-400"
                }`}>
                  {form.bio.length} / {TEAM_BIO_MAX}
                  {form.bio.length >= TEAM_BIO_MAX ? " — limit reached" : ""}
                </span>
              </div>
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
