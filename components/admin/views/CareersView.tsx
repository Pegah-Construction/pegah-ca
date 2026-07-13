"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { PERMS } from "@/lib/admin";
import { StatCard, Card, THead, Table, Pill, PrimaryBtn, Field, inputCls, SearchInput } from "../ui";

type Job = {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string;
  status: string;
  createdAt: string;
};

const DEPARTMENTS = [
  "Construction", "Project Management", "Estimating",
  "Safety", "Administration", "Engineering", "Other",
];
const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Seasonal"];
const STATUSES = ["Draft", "Published", "Closed"];

const emptyForm = () => ({
  title: "", department: "", location: "Toronto, ON",
  type: "Full-time", description: "", requirements: "", status: "Draft",
});

export default function CareersView() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch("/api/jobs?all=1").then((r) => r.json()).then(setJobs);
  }, []);

  if (!user) return null;
  const canManage = PERMS[user.role].manageCareers;
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const openCreate = () => { setForm(emptyForm()); setEditingId(null); setOpen(true); };
  const openEdit = (j: Job) => {
    setForm({ title: j.title, department: j.department, location: j.location, type: j.type, description: j.description, requirements: j.requirements, status: j.status });
    setEditingId(j.id);
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (editingId) {
      const res = await fetch(`/api/jobs/${editingId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const updated = await res.json();
      setJobs((prev) => prev.map((j) => j.id === editingId ? updated : j));
    } else {
      const res = await fetch("/api/jobs", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const created = await res.json();
      setJobs((prev) => [created, ...prev]);
    }
    setOpen(false);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (deletingId) return;
    if (!confirm("Delete this job posting? This cannot be undone.")) return;
    setDeletingId(id);
    await fetch(`/api/jobs/${id}`, { method: "DELETE" });
    setJobs((prev) => prev.filter((j) => j.id !== id));
    setDeletingId(null);
  };

  const toggleStatus = async (j: Job) => {
    const next = j.status === "Published" ? "Draft" : "Published";
    const res = await fetch(`/api/jobs/${j.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...j, status: next }),
    });
    const updated = await res.json();
    setJobs((prev) => prev.map((x) => x.id === j.id ? updated : x));
  };

  const published = jobs.filter((j) => j.status === "Published").length;
  const drafts = jobs.filter((j) => j.status === "Draft").length;

  const needle = q.trim().toLowerCase();
  const filtered = needle
    ? jobs.filter((j) => [j.title, j.department, j.location, j.type, j.status].some((v) => v.toLowerCase().includes(needle)))
    : jobs;

  const statusTone = (s: string) => s === "Published" ? "green" : s === "Closed" ? "gray" : "amber";

  return (
    <>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Published" value={published} hint="live on the website" />
        <StatCard label="Drafts" value={drafts} hint="not yet visible" />
        <StatCard label="Total postings" value={jobs.length} hint="all time" />
      </div>

      <Card
        title="Job Postings"
        right={
          <div className="flex items-center gap-3">
            <SearchInput value={q} onChange={setQ} placeholder="Search postings…" />
            {canManage && <PrimaryBtn onClick={openCreate}>+ New posting</PrimaryBtn>}
          </div>
        }
      >
        <Table>
          <THead cols={["Position", "Department", "Location", "Type", "Status", ""]} />
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center font-body text-concrete-400">
                  No job postings yet.
                </td>
              </tr>
            ) : filtered.map((j) => (
              <tr key={j.id} className="border-b border-concrete-100 last:border-0 hover:bg-brand-50/40">
                <td className="px-5 py-3">
                  <div className="font-display font-semibold text-ink">{j.title}</div>
                  <div className="font-mono text-[11px] text-concrete-400">{new Date(j.createdAt).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}</div>
                </td>
                <td className="px-5 py-3 text-sm text-concrete-600">{j.department || "—"}</td>
                <td className="px-5 py-3 text-sm text-concrete-600">{j.location}</td>
                <td className="px-5 py-3">
                  <span className="rounded-full bg-brand-50 px-2.5 py-1 font-mono text-[10px] uppercase tracking-label text-brand-700">{j.type}</span>
                </td>
                <td className="px-5 py-3">
                  <Pill text={j.status} tone={statusTone(j.status)} />
                </td>
                <td className="px-5 py-3 text-right">
                  {canManage && (
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => openEdit(j)} className="font-display text-xs font-semibold text-concrete-500 hover:text-ink">Edit</button>
                      <button
                        onClick={() => toggleStatus(j)}
                        className={`font-display text-xs font-semibold ${j.status === "Published" ? "text-concrete-500 hover:text-ink" : "text-brand-700 hover:text-brand-800"}`}
                      >
                        {j.status === "Published" ? "Unpublish" : "Publish"}
                      </button>
                      <button onClick={() => handleDelete(j.id)} disabled={!!deletingId} className="font-display text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50">
                        {deletingId === j.id ? "…" : "Delete"}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-concrete-200 px-6 py-4">
              <h2 className="font-display text-sm font-bold text-ink">{editingId ? "Edit job posting" : "New job posting"}</h2>
              <button onClick={() => setOpen(false)} className="rounded-md p-1 text-concrete-400 hover:bg-concrete-100 hover:text-ink">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
              <div className="flex-1 space-y-4 overflow-y-auto p-6">
                <Field label="Job title">
                  <input required className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Senior Project Manager" />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Department">
                    <select className={inputCls} value={form.department} onChange={(e) => set("department", e.target.value)}>
                      <option value="">Select…</option>
                      {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </Field>
                  <Field label="Employment type">
                    <select className={inputCls} value={form.type} onChange={(e) => set("type", e.target.value)}>
                      {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Location">
                    <input className={inputCls} value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Toronto, ON" />
                  </Field>
                  <Field label="Status">
                    <select className={inputCls} value={form.status} onChange={(e) => set("status", e.target.value)}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Description">
                  <textarea
                    rows={5}
                    className={inputCls}
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="Describe the role, responsibilities, and what a typical day looks like…"
                  />
                </Field>
                <Field label="Requirements">
                  <textarea
                    rows={4}
                    className={inputCls}
                    value={form.requirements}
                    onChange={(e) => set("requirements", e.target.value)}
                    placeholder="List qualifications, experience, and certifications required. One per line."
                  />
                </Field>
              </div>
              <div className="flex justify-end gap-2 border-t border-concrete-100 px-6 py-4">
                <button type="button" onClick={() => setOpen(false)} className="rounded-md px-4 py-2 text-sm font-medium text-concrete-600 hover:text-ink">Cancel</button>
                <button type="submit" disabled={saving} className="rounded-md bg-brand-700 px-4 py-2 font-display text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50">
                  {saving ? "Saving…" : editingId ? "Save changes" : "Create posting"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
