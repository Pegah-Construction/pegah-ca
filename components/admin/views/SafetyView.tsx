"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { getUser, type Incident } from "@/lib/admin";
import { Card, THead, Table, StatusPill, Pill, StatCard, PrimaryBtn, Modal, Field, inputCls } from "../ui";

const TYPES = ["Near miss","Hazard","First aid","Lost time","Property damage"];
const SEVERITIES = ["Low","Medium","High"];
const STATUSES = ["Open","Under review","Closed"];
type ProjectRow = { id: string; name: string };

const empty = () => ({ projectId:"", date: new Date().toISOString().slice(0,10), type:TYPES[0], severity:"Low", note:"", status:"Open" });

export default function SafetyView() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [projects, setProjects] = useState<ProjectRow[]>([]);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/incidents?userId=${user.id}`).then((r) => r.json()).then(setIncidents);
    fetch(`/api/projects?userId=${user.id}`).then((r) => r.json()).then(setProjects);
  }, [user]);

  if (!user) return null;
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const openCreate = () => { setForm(empty()); setEditingId(null); setOpen(true); };
  const openEdit = (s: Incident) => {
    setForm({ projectId: s.project, date: s.date, type: s.type, severity: s.severity, note: s.note, status: s.status });
    setEditingId(s.id);
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (editingId) {
      const res = await fetch(`/api/incidents/${editingId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const updated = await res.json();
      setIncidents((prev) => prev.map((s) => s.id === editingId ? { ...s, ...updated } : s));
    } else {
      const res = await fetch("/api/incidents", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, reportedById: user.id }),
      });
      const created = await res.json();
      setIncidents((prev) => [created, ...prev]);
    }
    setOpen(false);
    setSaving(false);
  };

  const open_ = incidents.filter((s) => s.status === "Open").length;
  const review = incidents.filter((s) => s.status === "Under review").length;
  const closed = incidents.filter((s) => s.status === "Closed").length;

  return (
    <>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Open" value={open_} />
        <StatCard label="Under review" value={review} />
        <StatCard label="Closed" value={closed} />
      </div>
      <Card title="Safety incidents" right={<PrimaryBtn onClick={openCreate}>+ Report incident</PrimaryBtn>}>
        <Table>
          <THead cols={["Date", "Project", "Type", "Severity", "Detail", "Reported by", "Status", ""]} />
          <tbody>
            {incidents.map((s) => (
              <tr key={s.id} className="border-b border-concrete-100 transition-colors last:border-0 hover:bg-brand-50/40">
                <td className="px-5 py-3 font-mono text-xs text-concrete-500">{s.date}</td>
                <td className="px-5 py-3 text-concrete-600">{projects.find((p) => p.id === s.project)?.name ?? s.project}</td>
                <td className="px-5 py-3"><Pill text={s.type} /></td>
                <td className="px-5 py-3"><Pill text={s.severity} tone={s.severity === "High" ? "red" : s.severity === "Medium" ? "amber" : "gray"} /></td>
                <td className="px-5 py-3 text-ink">{s.note}</td>
                <td className="px-5 py-3 text-concrete-500">{getUser(s.reportedBy)?.name ?? "—"}</td>
                <td className="px-5 py-3"><StatusPill status={s.status} /></td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => openEdit(s)} className="font-display text-xs font-semibold text-brand-700 hover:text-brand-800">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      {open && (
        <Modal title={editingId ? "Edit incident" : "Report incident"} onClose={() => setOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!editingId && (
              <Field label="Project">
                <select required className={inputCls} value={form.projectId} onChange={(e) => set("projectId", e.target.value)}>
                  <option value="">Select project…</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </Field>
            )}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Date">
                <input required type="date" className={inputCls} value={form.date} onChange={(e) => set("date", e.target.value)} />
              </Field>
              <Field label="Type">
                <select className={inputCls} value={form.type} onChange={(e) => set("type", e.target.value)}>
                  {TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Severity">
                <select className={inputCls} value={form.severity} onChange={(e) => set("severity", e.target.value)}>
                  {SEVERITIES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              {editingId && (
                <Field label="Status">
                  <select className={inputCls} value={form.status} onChange={(e) => set("status", e.target.value)}>
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </Field>
              )}
            </div>
            <Field label="Notes / description">
              <textarea required rows={3} className={`${inputCls} resize-none`} value={form.note} onChange={(e) => set("note", e.target.value)} placeholder="Describe what happened…" />
            </Field>
            <div className="flex justify-end gap-2 border-t border-concrete-100 pt-4">
              <button type="button" onClick={() => setOpen(false)} className="rounded-md px-4 py-2 text-sm font-medium text-concrete-600 hover:text-ink">Cancel</button>
              <button type="submit" disabled={saving} className="rounded-md bg-brand-700 px-4 py-2 font-display text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50">
                {saving ? "Saving…" : editingId ? "Save changes" : "Submit report"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
