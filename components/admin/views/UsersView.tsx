"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { ROLES, type RoleKey } from "@/lib/admin";
import { Card, THead, Table, RolePill, Pill, Avatar, PrimaryBtn, Modal, Field, inputCls, SearchInput } from "../ui";

type UserRow = { id: string; name: string; role: string; title: string; email: string; phone: string; status: string; since: string };

const empty = () => ({ name:"", email:"", role:"pm" as RoleKey, title:"", phone:"" });

export default function UsersView() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch("/api/users").then((r) => r.json()).then(setUsers);
  }, []);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const openCreate = () => { setForm(empty()); setEditingId(null); setOpen(true); };
  const openEdit = (u: UserRow) => {
    setForm({ name: u.name, email: u.email, role: u.role as RoleKey, title: u.title, phone: u.phone ?? "" });
    setEditingId(u.id);
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (editingId) {
      const res = await fetch(`/api/users/${editingId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const updated = await res.json();
      setUsers((prev) => prev.map((u) => u.id === editingId ? { ...u, ...updated } : u));
    } else {
      const res = await fetch("/api/users", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const created = await res.json();
      setUsers((prev) => [...prev, created]);
    }
    setOpen(false);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (deletingId) return;
    if (id === user?.id) { alert("You cannot delete your own account."); return; }
    if (!confirm("Delete this user? This cannot be undone.")) return;
    setDeletingId(id);
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } else {
      const data = await res.json().catch(() => null);
      alert(data?.error ?? "Failed to delete user.");
    }
    setDeletingId(null);
  };

  const needle = q.trim().toLowerCase();
  const filtered = needle
    ? users.filter((m) => [m.name, m.email, m.title, m.role, m.status].some((v) => v.toLowerCase().includes(needle)))
    : users;

  return (
    <>
      <Card title="Users & roles" right={
        <div className="flex items-center gap-3">
          <SearchInput value={q} onChange={setQ} placeholder="Search users…" />
          <PrimaryBtn onClick={openCreate}>+ Invite user</PrimaryBtn>
        </div>
      }>
        <Table>
          <THead cols={["User", "Title", "Role", "Status", "Since", ""]} />
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} className="border-b border-concrete-100 last:border-0 hover:bg-brand-50/40">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={m.name} id={m.id} size="h-8 w-8 text-[11px]" />
                    <div><div className="font-display font-semibold text-ink">{m.name}</div><div className="font-mono text-[11px] text-concrete-500">{m.email}</div></div>
                  </div>
                </td>
                <td className="px-5 py-3 text-concrete-600">{m.title}</td>
                <td className="px-5 py-3"><RolePill role={m.role as RoleKey} /></td>
                <td className="px-5 py-3"><Pill text={m.status} tone={m.status === "Active" ? "green" : "amber"} /></td>
                <td className="px-5 py-3 font-mono text-xs text-concrete-500">{m.since}</td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button onClick={() => openEdit(m)} className="font-display text-xs font-semibold text-brand-700 hover:text-brand-800">Edit</button>
                    <button onClick={() => handleDelete(m.id)} disabled={!!deletingId}
                      className="font-display text-xs font-semibold text-red-600 transition-opacity hover:text-red-700 disabled:opacity-50">
                      {deletingId === m.id ? "…" : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {(Object.keys(ROLES) as RoleKey[]).map((k) => (
          <div key={k} className="rounded-xl border border-concrete-200 bg-white p-5">
            <div className="flex items-center gap-2"><RolePill role={k} /></div>
            <p className="mt-3 text-sm text-concrete-500">{ROLES[k].blurb}</p>
          </div>
        ))}
      </div>

      {open && (
        <Modal title={editingId ? "Edit user" : "Invite user"} onClose={() => setOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Full name">
              <input required className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Alex Nguyen" />
            </Field>
            <Field label="Email">
              <input required type="email" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="a.nguyen@pegah.ca" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Role">
                <select className={inputCls} value={form.role} onChange={(e) => set("role", e.target.value)}>
                  <option value="admin">Administrator</option>
                  <option value="pm">Project Manager</option>
                  <option value="foreman">Site Foreman</option>
                </select>
              </Field>
              <Field label="Phone">
                <input className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="416 739 0000" />
              </Field>
            </div>
            <Field label="Job title">
              <input required className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Project Coordinator" />
            </Field>
            <div className="flex justify-end gap-2 border-t border-concrete-100 pt-4">
              <button type="button" onClick={() => setOpen(false)} className="rounded-md px-4 py-2 text-sm font-medium text-concrete-600 hover:text-ink">Cancel</button>
              <button type="submit" disabled={saving} className="rounded-md bg-brand-700 px-4 py-2 font-display text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50">
                {saving ? "Saving…" : editingId ? "Save changes" : "Add user"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
