"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { PERMS, moneyFull, type Project, type Incident } from "@/lib/admin";
import {
  Card, THead, Table, StatusPill, RolePill, Pill, Bar, Avatar,
  StatCard, AccessDenied, Modal, Field, inputCls,
} from "../ui";

const SECTORS = ["Commercial","Industrial","Residential","Transportation","Recreational","Retail","Historical"];
const STATUSES = ["Planning","In Progress","On Hold","Complete"] as Project["status"][];
const STATUS_SELECT_TONE: Record<Project["status"], string> = {
  Planning: "bg-amber-50 text-amber-700 ring-amber-600/20",
  "In Progress": "bg-brand-50 text-brand-700 ring-brand-600/20",
  "On Hold": "bg-red-50 text-red-700 ring-red-600/20",
  Complete: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
};

type MilestoneEdit = { n: string; d: string; done: boolean };
type UserRow = { id: string; name: string; role: string };
type ClientRow = { id: string; name: string };

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
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [denied, setDenied] = useState(false);

  // Project edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ name:"", clientId:"", sector:"", status:"Planning", pmId:"", foremanId:"", location:"", budget:"", start:"", end:"" });
  const [saving, setSaving] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);

  // Timeline editing
  const [editingTimeline, setEditingTimeline] = useState(false);
  const [milestones, setMilestones] = useState<MilestoneEdit[]>([]);
  const [savingTimeline, setSavingTimeline] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/projects/${id}?userId=${user.id}`)
      .then((r) => { if (r.status === 404) { setDenied(true); return null; } return r.json(); })
      .then((data) => { if (data) { setProject(data); setMilestones(data.milestones); } });
    fetch(`/api/incidents?userId=${user.id}&projectId=${id}`).then((r) => r.json()).then(setIncidents);
    fetch("/api/clients").then((r) => r.json()).then(setClients);
    fetch("/api/users").then((r) => r.json()).then(setUsers);
  }, [user, id]);

  if (!user) return null;
  if (denied) return <AccessDenied msg="You don't have access to this project." />;
  if (!project) return null;

  const perms = PERMS[user.role];
  const x = project;
  const pm = users.find((u) => u.id === x.pm);
  const fm = users.find((u) => u.id === x.foreman);
  const done = milestones.filter((m) => m.done).length;
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const updateStatus = async (newStatus: Project["status"]) => {
    setUpdatingStatus(true);
    setProject((prev) => prev ? { ...prev, status: newStatus } : prev);
    await fetch(`/api/projects/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setUpdatingStatus(false);
  };

  const openEdit = () => {
    setForm({
      name: x.name, clientId: x.client, sector: x.sector, status: x.status,
      pmId: x.pm, foremanId: x.foreman, location: x.location,
      budget: String(x.budget), start: x.start, end: x.end,
    });
    setEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/projects/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const updated = await res.json();
    setProject((prev) => prev ? { ...prev, ...updated } : prev);
    setEditOpen(false);
    setSaving(false);
  };

  // Timeline helpers
  const startEditTimeline = () => { setMilestones([...x.milestones]); setEditingTimeline(true); };
  const cancelTimeline = () => { setMilestones([...x.milestones]); setEditingTimeline(false); };

  const setM = (i: number, key: keyof MilestoneEdit, val: string | boolean) =>
    setMilestones((prev) => prev.map((m, idx) => idx === i ? { ...m, [key]: val } : m));

  const addMilestone = () =>
    setMilestones((prev) => [...prev, { n: "", d: "", done: false }]);

  const removeMilestone = (i: number) =>
    setMilestones((prev) => prev.filter((_, idx) => idx !== i));

  const saveTimeline = async () => {
    setSavingTimeline(true);
    const res = await fetch(`/api/projects/${id}/milestones`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(milestones),
    });
    const { milestones: saved, progress } = await res.json();
    setProject((prev) => prev ? { ...prev, milestones: saved, progress } : prev);
    setMilestones(saved);
    setEditingTimeline(false);
    setSavingTimeline(false);
  };

  const pms = users.filter((u) => u.role === "pm" || u.role === "admin");
  const foremen = users.filter((u) => u.role === "foreman");

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/projects" className="font-mono text-xs text-concrete-500 hover:text-brand-700">← All projects</Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h2 className="font-display text-2xl font-black tracking-tight text-ink">{x.name}</h2>
          {perms.editProjects ? (
            <select
              value={x.status}
              onChange={(e) => updateStatus(e.target.value as Project["status"])}
              disabled={updatingStatus}
              className={`cursor-pointer rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset outline-none transition-opacity disabled:opacity-50 ${STATUS_SELECT_TONE[x.status]}`}
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          ) : (
            <StatusPill status={x.status} />
          )}
          <Pill text={x.sector} />
          {perms.editProjects && (
            <button onClick={openEdit} className="ml-auto rounded-md border border-concrete-200 bg-white px-3 py-1.5 font-display text-xs font-semibold text-ink hover:bg-concrete-50">
              Edit project
            </button>
          )}
        </div>
        <p className="mt-1 font-mono text-xs text-concrete-500">{clients.find((c) => c.id === x.client)?.name} · {x.location} · {x.start} → {x.end}</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Completion" value={`${x.progress}%`} hint={<Bar pct={x.progress} />} />
        {perms.viewBudget
          ? <StatCard label="Budget" value={moneyFull(x.budget)} />
          : <StatCard label="Milestones" value={`${done} / ${milestones.length}`} />}
        {perms.viewBudget
          ? <StatCard label="Spent" value={moneyFull(x.spent)} hint={`${Math.round((x.spent / x.budget) * 100)}% of budget`} />
          : <StatCard label="Team" value={`${x.team.length} people`} />}
        {perms.viewBudget
          ? <StatCard label="Remaining" value={moneyFull(x.budget - x.spent)} />
          : <StatCard label="Foreman" value={fm?.name ?? "—"} />}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">

          {/* Timeline */}
          <section className="rounded-xl border border-concrete-200 bg-white">
            <div className="flex items-center justify-between border-b border-concrete-200 px-5 py-4">
              <h2 className="font-display text-sm font-bold tracking-tight text-ink">Project timeline</h2>
              {perms.editProjects && !editingTimeline && (
                <button onClick={startEditTimeline} className="rounded-md border border-concrete-200 px-3 py-1 font-display text-xs font-semibold text-ink hover:bg-concrete-50">
                  Edit timeline
                </button>
              )}
            </div>

            {editingTimeline ? (
              <div className="px-5 py-5">
                <div className="space-y-2">
                  {milestones.map((m, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={m.done}
                        onChange={(e) => setM(i, "done", e.target.checked)}
                        className="h-4 w-4 cursor-pointer rounded border-concrete-300 accent-brand-700"
                      />
                      <input
                        type="text"
                        value={m.n}
                        onChange={(e) => setM(i, "n", e.target.value)}
                        placeholder="Milestone name"
                        className="flex-1 rounded-md border border-concrete-200 px-2.5 py-1.5 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                      <input
                        type="month"
                        value={m.d}
                        onChange={(e) => setM(i, "d", e.target.value)}
                        className="w-36 rounded-md border border-concrete-200 px-2.5 py-1.5 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                      <button onClick={() => removeMilestone(i)} className="rounded p-1 text-concrete-400 hover:bg-red-50 hover:text-red-500">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M18 6 6 18M6 6l12 12"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={addMilestone} className="mt-3 font-display text-xs font-semibold text-brand-700 hover:text-brand-800">
                  + Add milestone
                </button>
                <div className="mt-4 flex gap-2 border-t border-concrete-100 pt-4">
                  <button onClick={cancelTimeline} className="rounded-md px-3 py-1.5 text-sm font-medium text-concrete-600 hover:text-ink">Cancel</button>
                  <button onClick={saveTimeline} disabled={savingTimeline} className="rounded-md bg-brand-700 px-3 py-1.5 font-display text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50">
                    {savingTimeline ? "Saving…" : "Save timeline"}
                  </button>
                </div>
              </div>
            ) : (
              <ul className="px-5 py-5">
                {milestones.length === 0 && (
                  <li className="text-sm text-concrete-400">No milestones yet.</li>
                )}
                {milestones.map((m, i) => {
                  const last = i === milestones.length - 1;
                  return (
                    <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
                      {!last && <span className="absolute left-[7px] top-4 h-full w-px bg-concrete-200" />}
                      <span className={`relative z-10 mt-1 h-4 w-4 shrink-0 rounded-full border-2 ${m.done ? "border-brand-600 bg-brand-600" : "border-concrete-300 bg-white"}`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`font-display text-sm font-semibold ${m.done ? "text-ink" : "text-concrete-500"}`}>{m.n}</span>
                          <span className="font-mono text-xs text-concrete-400">{m.d}</span>
                        </div>
                        <span className={`font-mono text-[11px] ${m.done ? "text-emerald-600" : "text-concrete-400"}`}>{m.done ? "Completed" : "Upcoming"}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Safety */}
          <Card title="Safety">
            <Table>
              <THead cols={["Date", "Type", "Detail", "Reported by", "Status"]} />
              <tbody>
                {incidents.length ? incidents.map((s) => (
                  <tr key={s.id} className="border-b border-concrete-100 last:border-0">
                    <td className="px-5 py-3 font-mono text-xs text-concrete-500">{s.date}</td>
                    <td className="px-5 py-3"><Pill text={s.type} /></td>
                    <td className="px-5 py-3 text-ink">{s.note}</td>
                    <td className="px-5 py-3 text-concrete-500">{users.find((u) => u.id === s.reportedBy)?.name ?? "—"}</td>
                    <td className="px-5 py-3"><StatusPill status={s.status} /></td>
                  </tr>
                )) : <tr><td colSpan={5} className="px-5 py-6 text-sm text-concrete-400">No incidents reported.</td></tr>}
              </tbody>
            </Table>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card title="Project team">
            <ul className="divide-y divide-concrete-100">
              {x.team.map((tid) => {
                const tu = users.find((u) => u.id === tid);
                if (!tu) return null;
                return (
                  <li key={tid} className="flex items-center gap-3 px-5 py-3">
                    <Avatar name={tu.name} id={tu.id} size="h-8 w-8 text-[11px]" />
                    <div className="flex-1"><div className="font-display text-sm font-semibold text-ink">{tu.name}</div><div className="font-mono text-[11px] text-concrete-500">{tu.title}</div></div>
                    <RolePill role={tu.role} />
                  </li>
                );
              })}
            </ul>
          </Card>
          <Card title="Key facts">
            <dl className="divide-y divide-concrete-100 px-5">
              <Fact k="Client" v={clients.find((c) => c.id === x.client)?.name ?? "—"} />
              <Fact k="Sector" v={x.sector} />
              <Fact k="Location" v={x.location} />
              <Fact k="Project manager" v={pm?.name ?? "—"} />
              <Fact k="Foreman" v={fm?.name ?? "—"} />
              <Fact k="Start" v={x.start} />
              <Fact k="Target finish" v={x.end} />
            </dl>
          </Card>
        </div>
      </div>

      {/* Edit project modal */}
      {editOpen && (
        <Modal title="Edit project" onClose={() => setEditOpen(false)}>
          <form onSubmit={handleEdit} className="space-y-4">
            <Field label="Project name">
              <input required className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Client">
                <select required className={inputCls} value={form.clientId} onChange={(e) => set("clientId", e.target.value)}>
                  <option value="">Select client…</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Sector">
                <select className={inputCls} value={form.sector} onChange={(e) => set("sector", e.target.value)}>
                  {SECTORS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Status">
                <select className={inputCls} value={form.status} onChange={(e) => set("status", e.target.value)}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Location">
                <input required className={inputCls} value={form.location} onChange={(e) => set("location", e.target.value)} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Project manager">
                <select required className={inputCls} value={form.pmId} onChange={(e) => set("pmId", e.target.value)}>
                  <option value="">Select PM…</option>
                  {pms.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </Field>
              <Field label="Site foreman">
                <select required className={inputCls} value={form.foremanId} onChange={(e) => set("foremanId", e.target.value)}>
                  <option value="">Select foreman…</option>
                  {foremen.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Budget ($)">
              <input required type="number" min="0" className={inputCls} value={form.budget} onChange={(e) => set("budget", e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Start (month)">
                <input required type="month" className={inputCls} value={form.start} onChange={(e) => set("start", e.target.value)} />
              </Field>
              <Field label="End (month)">
                <input required type="month" className={inputCls} value={form.end} onChange={(e) => set("end", e.target.value)} />
              </Field>
            </div>
            <div className="flex justify-end gap-2 border-t border-concrete-100 pt-4">
              <button type="button" onClick={() => setEditOpen(false)} className="rounded-md px-4 py-2 text-sm font-medium text-concrete-600 hover:text-ink">Cancel</button>
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
