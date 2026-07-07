"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/lib/auth";
import { PERMS, type Article } from "@/lib/admin";
import { StatCard, Card, THead, Table, Pill, PrimaryBtn, Field, inputCls, SearchInput, Spinner } from "../ui";
import { getStorageUrl } from "@/lib/storage-url";

const RichEditor = dynamic(() => import("../RichEditor"), { ssr: false });

type UserRow = { id: string; name: string };
type ArticleWithBody = Article & { body?: string; coverImage?: string };

const empty = () => ({ title:"", tags:"", excerpt:"", body:"" });

export default function NewsView() {
  const { user } = useAuth();
  const [news, setNews] = useState<ArticleWithBody[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [formCoverImage, setFormCoverImage] = useState<string>("");
  const [uploadingCover, setUploadingCover] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [q, setQ] = useState("");

  // LinkedIn post viewer/editor
  const [linkedinFor, setLinkedinFor] = useState<ArticleWithBody | null>(null);
  const [linkedinText, setLinkedinText] = useState("");
  const [linkedinSaving, setLinkedinSaving] = useState(false);
  const [linkedinCopied, setLinkedinCopied] = useState(false);

  useEffect(() => {
    fetch("/api/news").then((r) => r.json()).then(setNews);
    fetch("/api/users").then((r) => r.json()).then(setUsers);
  }, []);

  if (!user) return null;
  const perms = PERMS[user.role];
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const openCreate = () => { setForm(empty()); setEditingId(null); setFormCoverImage(""); setOpen(true); };
  const openEdit = (n: ArticleWithBody) => {
    setForm({ title: n.title, tags: n.tags.join(", "), excerpt: n.excerpt, body: n.body ?? "" });
    setEditingId(n.id);
    setFormCoverImage(n.coverImage ?? "");
    setOpen(true);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingId) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/api/news/${editingId}/cover`, { method: "POST", body: fd });
    if (res.ok) {
      const { coverImage } = await res.json();
      setFormCoverImage(coverImage);
      setNews((prev) => prev.map((n) => n.id === editingId ? { ...n, coverImage } : n));
    }
    e.target.value = "";
    setUploadingCover(false);
  };

  const handleCoverDelete = async () => {
    if (!editingId) return;
    await fetch(`/api/news/${editingId}/cover`, { method: "DELETE" });
    setFormCoverImage("");
    setNews((prev) => prev.map((n) => n.id === editingId ? { ...n, coverImage: "" } : n));
  };

  const pub = news.filter((n) => n.status === "Published").length;
  const draft = news.filter((n) => n.status === "Draft").length;

  const needle = q.trim().toLowerCase();
  const filtered = needle
    ? news.filter((n) => {
        const author = users.find((u) => u.id === n.author)?.name ?? "";
        return [n.title, n.status, author, ...n.tags].some((v) => v.toLowerCase().includes(needle));
      })
    : news;

  const togglePublish = async (id: string) => {
    const article = news.find((n) => n.id === id);
    if (!article || togglingId) return;
    setTogglingId(id);
    const newStatus = article.status === "Published" ? "Draft" : "Published";
    setNews((prev) => prev.map((n) => (n.id === id ? { ...n, status: newStatus } : n)));
    await fetch(`/api/news/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, userId: user?.id }),
    });
    setTogglingId(null);
  };

  const handleDelete = async (id: string) => {
    if (deletingId) return;
    if (!confirm("Delete this article? This cannot be undone.")) return;
    setDeletingId(id);
    await fetch(`/api/news/${id}`, { method: "DELETE" });
    setNews((prev) => prev.filter((n) => n.id !== id));
    setDeletingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
    if (editingId) {
      const res = await fetch(`/api/news/${editingId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, tags, excerpt: form.excerpt, body: form.body }),
      });
      const updated = await res.json();
      setNews((prev) => prev.map((n) => n.id === editingId ? { ...n, ...updated } : n));
    } else {
      const res = await fetch("/api/news", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tags, authorId: user.id }),
      });
      const created = await res.json();
      setNews((prev) => [created, ...prev]);
    }
    setOpen(false);
    setSaving(false);
  };

  const openLinkedin = (n: ArticleWithBody) => {
    setLinkedinFor(n);
    setLinkedinText(n.linkedinPost ?? "");
    setLinkedinCopied(false);
  };

  const copyLinkedin = async () => {
    try {
      await navigator.clipboard.writeText(linkedinText);
      setLinkedinCopied(true);
      setTimeout(() => setLinkedinCopied(false), 2000);
    } catch {
      /* clipboard blocked — user can select manually */
    }
  };

  const saveLinkedin = async () => {
    if (!linkedinFor) return;
    setLinkedinSaving(true);
    const res = await fetch(`/api/news/${linkedinFor.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ linkedinPost: linkedinText }),
    });
    if (res.ok) {
      setNews((prev) => prev.map((n) => (n.id === linkedinFor.id ? { ...n, linkedinPost: linkedinText } : n)));
      setLinkedinFor((f) => (f ? { ...f, linkedinPost: linkedinText } : f));
    }
    setLinkedinSaving(false);
  };

  return (
    <>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Published" value={pub} hint="live on the website" />
        <StatCard label="Drafts" value={draft} hint="awaiting review" />
        <StatCard label="Total articles" value={news.length} hint="SEO case studies" />
      </div>

      <Card title="Articles" right={
        <div className="flex items-center gap-3">
          <SearchInput value={q} onChange={setQ} placeholder="Search articles…" />
          {perms.manageNews && <PrimaryBtn onClick={openCreate}>+ New article</PrimaryBtn>}
        </div>
      }>
        <Table>
          <THead cols={["Title", "Tags", "Author", "Date", "Status", ""]} />
          <tbody>
            {filtered.map((n) => {
              const a = users.find((u) => u.id === n.author);
              return (
                <tr key={n.id} className="border-b border-concrete-100 last:border-0 hover:bg-brand-50/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-semibold text-ink">{n.title}</span>
                      {n.featured && <span className="text-amber-500" title="Featured">★</span>}
                    </div>
                    <div className="font-mono text-[11px] text-concrete-500">/{n.slug} · {n.words} words</div>
                  </td>
                  <td className="px-5 py-3">
                    {n.tags.map((tg) => (
                      <span key={tg} className="mr-1 inline-block rounded bg-concrete-100 px-2 py-0.5 font-mono text-[10px] text-concrete-500">{tg}</span>
                    ))}
                  </td>
                  <td className="px-5 py-3 text-concrete-500">{a?.name ?? "—"}</td>
                  <td className="px-5 py-3 font-mono text-xs text-concrete-500">{n.date}</td>
                  <td className="px-5 py-3"><Pill text={n.status} tone={n.status === "Published" ? "green" : "amber"} /></td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {perms.manageNews && (
                        <button onClick={() => openEdit(n)} className="font-display text-xs font-semibold text-concrete-500 hover:text-ink">Edit</button>
                      )}
                      {perms.manageNews && (
                        <button onClick={() => openLinkedin(n)} title="View / copy the LinkedIn post"
                          className="flex items-center gap-1 font-display text-xs font-semibold text-[#0A66C2] hover:opacity-75">
                          <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>
                          LinkedIn
                        </button>
                      )}
                      {perms.manageNews && (
                        <button onClick={() => togglePublish(n.id)} disabled={!!togglingId}
                          className={`font-display text-xs font-semibold transition-opacity disabled:opacity-50 ${n.status === "Published" ? "text-concrete-500 hover:text-ink" : "text-brand-700 hover:text-brand-800"}`}>
                          {togglingId === n.id ? "…" : n.status === "Published" ? "Unpublish" : "Publish"}
                        </button>
                      )}
                      {perms.manageNews && (
                        <button onClick={() => handleDelete(n.id)} disabled={!!deletingId}
                          className="font-display text-xs font-semibold text-red-600 transition-opacity hover:text-red-700 disabled:opacity-50">
                          {deletingId === n.id ? "…" : "Delete"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-concrete-200 px-6 py-4">
              <h2 className="font-display text-sm font-bold text-ink">{editingId ? "Edit article" : "New article"}</h2>
              <button onClick={() => setOpen(false)} className="rounded-md p-1 text-concrete-400 hover:bg-concrete-100 hover:text-ink">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
              <div className="flex-1 space-y-4 overflow-y-auto p-6">
                <Field label="Title">
                  <input required className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Lessons from the Harbourside Build" />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Tags (comma-separated)">
                    <input className={inputCls} value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="e.g. Commercial, Design-Build" />
                  </Field>
                  <Field label="Excerpt">
                    <input className={inputCls} value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} placeholder="Short summary for listings…" />
                  </Field>
                </div>
                <Field label="Cover image">
                  {editingId ? (
                    <div className="flex items-start gap-3">
                      {formCoverImage ? (
                        <div className="group relative h-24 w-40 shrink-0 overflow-hidden rounded-lg bg-concrete-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getStorageUrl(formCoverImage)}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={handleCoverDelete}
                            className="absolute right-1 top-1 hidden rounded-full bg-black/60 p-1 text-white group-hover:block hover:bg-black/80"
                            title="Remove cover"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3 w-3">
                              <path d="M18 6 6 18M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="flex h-24 w-40 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-concrete-200 bg-concrete-100 text-xs text-concrete-400">
                          No cover
                        </div>
                      )}
                      <label className={`flex cursor-pointer items-center gap-1.5 self-end rounded-md border border-concrete-200 px-3 py-1.5 font-display text-xs font-semibold text-ink hover:bg-concrete-50 ${uploadingCover ? "pointer-events-none opacity-60" : ""}`}>
                        {uploadingCover && <Spinner className="h-3 w-3" />}
                        {uploadingCover ? "Uploading…" : "Upload cover"}
                        <input type="file" accept="image/*" className="sr-only" onChange={handleCoverUpload} disabled={uploadingCover} />
                      </label>
                    </div>
                  ) : (
                    <p className="text-xs text-concrete-400">Save the article first, then you can add a cover image.</p>
                  )}
                </Field>
                <Field label="Article body">
                  <RichEditor value={form.body} onChange={(html) => set("body", html)} articleId={editingId ?? undefined} />
                </Field>
              </div>
              <div className="flex justify-end gap-2 border-t border-concrete-100 px-6 py-4">
                <button type="button" onClick={() => setOpen(false)} className="rounded-md px-4 py-2 text-sm font-medium text-concrete-600 hover:text-ink">Cancel</button>
                <button type="submit" disabled={saving} className="rounded-md bg-brand-700 px-4 py-2 font-display text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50">
                  {saving ? "Saving…" : editingId ? "Save changes" : "Create draft"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LinkedIn post modal */}
      {linkedinFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setLinkedinFor(null)}>
          <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-concrete-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="#0A66C2" className="h-4 w-4"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>
                <h2 className="font-display text-sm font-bold text-ink">LinkedIn post</h2>
              </div>
              <button onClick={() => setLinkedinFor(null)} className="rounded-md p-1 text-concrete-400 hover:bg-concrete-100 hover:text-ink">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-6">
              <p className="truncate font-mono text-[11px] text-concrete-500">For: {linkedinFor.title}</p>
              {!linkedinText.trim() && (
                <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  No LinkedIn post yet. Write one below, or use “Generate blog post” on the project page to create one automatically.
                </p>
              )}
              <textarea
                value={linkedinText}
                onChange={(e) => setLinkedinText(e.target.value)}
                rows={12}
                placeholder="LinkedIn post copy…"
                className={`${inputCls} font-body leading-relaxed`}
              />
              <span className="block text-right font-mono text-[11px] text-concrete-400">{linkedinText.length} characters</span>
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-concrete-100 px-6 py-4">
              <button
                type="button"
                onClick={copyLinkedin}
                className="flex items-center gap-1.5 rounded-md border border-concrete-200 px-4 py-2 font-display text-sm font-semibold text-ink hover:bg-concrete-50"
              >
                {linkedinCopied ? (
                  <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5 text-emerald-600"><path d="M20 6 9 17l-5-5"/></svg>Copied!</>
                ) : (
                  <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy</>
                )}
              </button>
              <div className="flex gap-2">
                <button type="button" onClick={() => setLinkedinFor(null)} className="rounded-md px-4 py-2 text-sm font-medium text-concrete-600 hover:text-ink">Close</button>
                <button type="button" onClick={saveLinkedin} disabled={linkedinSaving} className="rounded-md bg-brand-700 px-4 py-2 font-display text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50">
                  {linkedinSaving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
