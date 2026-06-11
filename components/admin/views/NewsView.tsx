"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/lib/auth";
import { PERMS, STATS, getUser, type Article } from "@/lib/admin";
import { StatCard, Card, THead, Table, Pill, PrimaryBtn, Field, inputCls } from "../ui";

const RichEditor = dynamic(() => import("../RichEditor"), { ssr: false });

type UserRow = { id: string; name: string };
type ArticleWithBody = Article & { body?: string };

const empty = () => ({ title:"", tags:"", excerpt:"", authorId:"", body:"" });

export default function NewsView() {
  const { user } = useAuth();
  const [news, setNews] = useState<ArticleWithBody[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);

  useEffect(() => {
    fetch("/api/news").then((r) => r.json()).then(setNews);
  }, []);

  if (!user) return null;
  const perms = PERMS[user.role];
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const loadUsers = () => fetch("/api/users").then((r) => r.json()).then(setUsers);

  const openCreate = () => { setForm({ ...empty(), authorId: user.id }); setEditingId(null); loadUsers(); setOpen(true); };
  const openEdit = (n: ArticleWithBody) => {
    setForm({ title: n.title, tags: n.tags.join(", "), excerpt: n.excerpt, authorId: n.author, body: n.body ?? "" });
    setEditingId(n.id);
    loadUsers();
    setOpen(true);
  };

  const pub = news.filter((n) => n.status === "Published").length;
  const draft = news.filter((n) => n.status === "Draft").length;

  const togglePublish = async (id: string) => {
    const article = news.find((n) => n.id === id);
    if (!article || togglingId) return;
    setTogglingId(id);
    const newStatus = article.status === "Published" ? "Draft" : "Published";
    setNews((prev) => prev.map((n) => (n.id === id ? { ...n, status: newStatus } : n)));
    await fetch(`/api/news/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
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
        body: JSON.stringify({ title: form.title, authorId: form.authorId, tags, excerpt: form.excerpt, body: form.body }),
      });
      const updated = await res.json();
      setNews((prev) => prev.map((n) => n.id === editingId ? { ...n, ...updated } : n));
    } else {
      const res = await fetch("/api/news", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tags }),
      });
      const created = await res.json();
      setNews((prev) => [created, ...prev]);
    }
    setOpen(false);
    setSaving(false);
  };

  return (
    <>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Published" value={pub} hint="live on the website" />
        <StatCard label="Drafts" value={draft} hint="awaiting review" />
        <StatCard label="Total articles" value={STATS.articles} hint="SEO case studies" />
      </div>

      <Card title="Articles" right={perms.manageNews ? <PrimaryBtn onClick={openCreate}>+ New article</PrimaryBtn> : undefined}>
        <Table>
          <THead cols={["Title", "Tags", "Author", "Date", "Status", ""]} />
          <tbody>
            {news.map((n) => {
              const a = getUser(n.author);
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
                <Field label="Author">
                  <select required className={inputCls} value={form.authorId} onChange={(e) => set("authorId", e.target.value)}>
                    <option value="">Select author…</option>
                    {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Tags (comma-separated)">
                    <input className={inputCls} value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="e.g. Commercial, Design-Build" />
                  </Field>
                  <Field label="Excerpt">
                    <input className={inputCls} value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} placeholder="Short summary for listings…" />
                  </Field>
                </div>
                <Field label="Article body">
                  <RichEditor value={form.body} onChange={(html) => set("body", html)} />
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
    </>
  );
}
