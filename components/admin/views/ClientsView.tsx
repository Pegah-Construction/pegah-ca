"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { PERMS } from "@/lib/admin";
import { Card, THead, Table, Pill, PrimaryBtn, Modal, Field, inputCls, SearchInput } from "../ui";

type ClientRow = { id: string; name: string; sector: string; contact: string; email: string; phone: string; since: string };

const SECTORS = ["Commercial","Industrial","Residential","Transportation","Recreational","Retail","Historical","Institutional","Other"];
const empty = () => ({ name:"", sector:SECTORS[0], contact:"", email:"", phone:"" });

export default function ClientsView() {
  const { user } = useAuth();
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch("/api/clients").then((r) => r.json()).then(setClients);
  }, []);

  if (!user) return null;
  const perms = PERMS[user.role];
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const openCreate = () => { setForm(empty()); setEditingId(null); setOpen(true); };
  const openEdit = (c: ClientRow) => {
    setForm({ name: c.name, sector: c.sector, contact: c.contact, email: c.email, phone: c.phone });
    setEditingId(c.id);
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (editingId) {
      const res = await fetch(`/api/clients/${editingId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const updated = await res.json();
      setClients((prev) => prev.map((c) => c.id === editingId ? { ...c, ...updated } : c));
    } else {
      const res = await fetch("/api/clients", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const created = await res.json();
      setClients((prev) => [created, ...prev]);
    }
    setOpen(false);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (deletingId) return;
    if (!confirm("Delete this client? This cannot be undone.")) return;
    setDeletingId(id);
    const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
    if (res.ok) {
      setClients((prev) => prev.filter((c) => c.id !== id));
    } else {
      const data = await res.json().catch(() => null);
      alert(data?.error ?? "Failed to delete client.");
    }
    setDeletingId(null);
  };

  const needle = q.trim().toLowerCase();
  const filtered = needle
    ? clients.filter((c) => [c.name, c.sector, c.contact, c.email].some((v) => v.toLowerCase().includes(needle)))
    : clients;

  return (
    <>
      <Card title="Clients & companies" right={
        <div className="flex items-center gap-3">
          <SearchInput value={q} onChange={setQ} placeholder="Search clients…" />
          {perms.manageClients && <PrimaryBtn onClick={openCreate}>+ Add client</PrimaryBtn>}
        </div>
      }>
        <Table>
          <THead cols={["Client", "Sector", "Primary contact", "Email", "Since", ""]} />
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-concrete-100 last:border-0 hover:bg-brand-50/40">
                <td className="px-5 py-3"><div className="font-display font-semibold text-ink">{c.name}</div></td>
                <td className="px-5 py-3"><Pill text={c.sector} /></td>
                <td className="px-5 py-3 text-concrete-600">{c.contact}</td>
                <td className="px-5 py-3 font-mono text-xs text-concrete-500">{c.email}</td>
                <td className="px-5 py-3 font-mono text-xs text-concrete-500">{c.since}</td>
                <td className="px-5 py-3 text-right">
                  {perms.manageClients && (
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => openEdit(c)} className="font-display text-xs font-semibold text-brand-700 hover:text-brand-800">Edit</button>
                      <button onClick={() => handleDelete(c.id)} disabled={!!deletingId}
                        className="font-display text-xs font-semibold text-red-600 transition-opacity hover:text-red-700 disabled:opacity-50">
                        {deletingId === c.id ? "…" : "Delete"}
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
        <Modal title={editingId ? "Edit client" : "Add client"} onClose={() => setOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Company name">
              <input required className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Riverside Holdings" />
            </Field>
            <Field label="Sector">
              <select className={inputCls} value={form.sector} onChange={(e) => set("sector", e.target.value)}>
                {SECTORS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Primary contact name">
              <input required className={inputCls} value={form.contact} onChange={(e) => set("contact", e.target.value)} placeholder="e.g. J. Smith" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Email">
                <input required type="email" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="contact@company.com" />
              </Field>
              <Field label="Phone">
                <input className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="416 555 0100" />
              </Field>
            </div>
            <div className="flex justify-end gap-2 border-t border-concrete-100 pt-4">
              <button type="button" onClick={() => setOpen(false)} className="rounded-md px-4 py-2 text-sm font-medium text-concrete-600 hover:text-ink">Cancel</button>
              <button type="submit" disabled={saving} className="rounded-md bg-brand-700 px-4 py-2 font-display text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50">
                {saving ? "Saving…" : editingId ? "Save changes" : "Add client"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
