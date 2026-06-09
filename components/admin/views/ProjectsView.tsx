"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { PERMS, money, type Project } from "@/lib/admin";
import { Card, THead, Table, StatusPill, Bar, Pill, PrimaryBtn, Modal, Field, inputCls } from "../ui";

const SECTORS = ["Commercial","Industrial","Residential","Transportation","Recreational","Retail","Historical"];
const STATUSES = ["Planning","In Progress","On Hold","Complete"];

type UserRow = { id: string; name: string; role: string };
type ClientRow = { id: string; name: string };
const empty = () => ({ name:"", clientId:"", sector:SECTORS[0], status:"Planning", pmId:"", foremanId:"", location:"", budget:"", start:"", end:"" });

export default function ProjectsView() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/projects?userId=${user.id}`).then((r) => r.json()).then(setProjects);
    fetch("/api/clients").then((r) => r.json()).then(setClients);
    fetch("/api/users").then((r) => r.json()).then(setUsers);
  }, [user]);

  const loadDropdowns = () =>
    Promise.all([
      fetch("/api/clients").then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
    ]).then(([c, u]) => { setClients(c); setUsers(u); });

  const openCreate = () => { setForm(empty()); setEditingId(null); loadDropdowns(); setOpen(true); };

  const openEdit = (p: Project) => {
    setForm({
      name: p.name, clientId: p.client, sector: p.sector, status: p.status,
      pmId: p.pm, foremanId: p.foreman, location: p.location,
      budget: String(p.budget), start: p.start, end: p.end,
    });
    setEditingId(p.id);
    loadDropdowns();
    setOpen(true);
  };

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

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
      setProjects((prev) => prev.map((p) => p.id === editingId ? { ...p, ...updated } : p));
    } else {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const created = await res.json();
      setProjects((prev) => [created, ...prev]);
    }
    setOpen(false);
    setSaving(false);
  };

  if (!user) return null;
  const perms = PERMS[user.role];
  const pms = users.filter((u) => u.role === "pm" || u.role === "admin");
  const foremen = users.filter((u) => u.role === "foreman");

  return (
    <>
      {perms.projectScope !== "all" && (
        <p className="mb-4 text-sm text-concrete-500">
          Showing the {projects.length} project{projects.length === 1 ? "" : "s"} {perms.projectScope === "managed" ? "you manage" : "you're assigned to"}.
        </p>
      )}
      <Card title="All projects" right={perms.editProjects ? <PrimaryBtn onClick={openCreate}>+ New project</PrimaryBtn> : undefined}>
        <Table>
          <THead cols={["Project", "Client", "Sector", "Status", "Progress", ...(perms.viewBudget ? ["Spent / Budget"] : []), "PM", ""]} />
          <tbody>
            {projects.map((x) => {
              const pm = users.find((u) => u.id === x.pm);
              return (
                <tr key={x.id} className="border-b border-concrete-100 transition-colors last:border-0 hover:bg-brand-50/40">
                  <td className="cursor-pointer px-5 py-3" onClick={() => (location.href = `/admin/projects/${x.id}`)}>
                    <div className="font-display font-semibold text-ink">{x.name}</div>
                    <div className="font-mono text-[11px] text-concrete-500">{x.location}</div>
                  </td>
                  <td className="px-5 py-3 text-concrete-500">{clients.find((c) => c.id === x.client)?.name ?? "—"}</td>
                  <td className="px-5 py-3"><Pill text={x.sector} /></td>
                  <td className="px-5 py-3"><StatusPill status={x.status} /></td>
                  <td className="px-5 py-3"><Bar pct={x.progress} /></td>
                  {perms.viewBudget && <td className="px-5 py-3 font-mono text-xs text-concrete-500">{money(x.spent)} / {money(x.budget)}</td>}
                  <td className="px-5 py-3 text-concrete-500">{pm?.name ?? "—"}</td>
                  <td className="px-5 py-3 text-right">
                    {perms.editProjects && (
                      <button onClick={() => openEdit(x)} className="font-display text-xs font-semibold text-brand-700 hover:text-brand-800">Edit</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>

      {open && (
        <Modal title={editingId ? "Edit project" : "New project"} onClose={() => setOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Project name">
              <input required className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Riverside Office Tower" />
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
                <input required className={inputCls} value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Toronto, ON" />
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
              <input required type="number" min="0" className={inputCls} value={form.budget} onChange={(e) => set("budget", e.target.value)} placeholder="e.g. 5000000" />
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
              <button type="button" onClick={() => setOpen(false)} className="rounded-md px-4 py-2 text-sm font-medium text-concrete-600 hover:text-ink">Cancel</button>
              <button type="submit" disabled={saving} className="rounded-md bg-brand-700 px-4 py-2 font-display text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50">
                {saving ? "Saving…" : editingId ? "Save changes" : "Create project"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
