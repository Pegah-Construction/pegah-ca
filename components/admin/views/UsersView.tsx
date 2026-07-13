"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { ROLES, type RoleKey } from "@/lib/admin";
import { Card, THead, Table, RolePill, Pill, Avatar, PrimaryBtn, Modal, Field, inputCls, SearchInput } from "../ui";

type UserRow = { id: string; name: string; role: string; title: string; email: string; phone: string; status: string; since: string };

const emptyForm = () => ({
  name: "", email: "", role: "pm" as RoleKey, title: "", phone: "", status: "Active", password: "",
});

export default function UsersView() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/users").then((r) => r.json()).then(setUsers);
  }, []);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const openCreate = () => { setForm(emptyForm()); setEditingId(null); setOpen(true); };
  const openEdit = (u: UserRow) => {
    setForm({ name: u.name, email: u.email, role: u.role as RoleKey, title: u.title, phone: u.phone ?? "", status: u.status, password: "" });
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
      setOpen(false);
    } else {
      const res = await fetch("/api/users", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const created = await res.json();
      if (created.password) setCreatedPassword(created.password);
      const { password: _pw, ...userRow } = created;
      setUsers((prev) => [...prev, userRow]);
      setOpen(false);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (deletingId) return;
    if (id === me?.id) { alert("You cannot delete your own account."); return; }
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
      {/* Temporary password reveal — shown once after user creation */}
      {createdPassword && (
        <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
          <div>
            <p className="font-display text-sm font-semibold text-emerald-800">User created successfully</p>
            <p className="mt-0.5 text-sm text-emerald-700">
              Share this temporary password — it won&apos;t be shown again:
              <span className="ml-2 rounded bg-white px-2 py-0.5 font-mono text-sm font-semibold text-ink ring-1 ring-emerald-200">
                {createdPassword}
              </span>
            </p>
          </div>
          <button onClick={() => setCreatedPassword(null)} className="shrink-0 text-emerald-500 hover:text-emerald-700">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      <Card title="Users & roles" right={
        <div className="flex items-center gap-3">
          <SearchInput value={q} onChange={setQ} placeholder="Search users…" />
          <PrimaryBtn onClick={openCreate}>+ Add user</PrimaryBtn>
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
                    <div>
                      <div className="font-display font-semibold text-ink">{m.name}</div>
                      <div className="font-mono text-[11px] text-concrete-500">{m.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-concrete-600">{m.title}</td>
                <td className="px-5 py-3"><RolePill role={m.role as RoleKey} /></td>
                <td className="px-5 py-3"><Pill text={m.status} tone={m.status === "Active" ? "green" : "amber"} /></td>
                <td className="px-5 py-3 font-mono text-xs text-concrete-500">{m.since}</td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button onClick={() => openEdit(m)} className="font-display text-xs font-semibold text-brand-700 hover:text-brand-800">Edit</button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      disabled={!!deletingId}
                      className="font-display text-xs font-semibold text-red-600 transition-opacity hover:text-red-700 disabled:opacity-50"
                    >
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
        <Modal title={editingId ? "Edit user" : "Add user"} onClose={() => setOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Full name">
              <input required className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Alex Nguyen" />
            </Field>
            <Field label="Email">
              <input required type="email" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="a.nguyen@pegah.ca" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Role">
                <select className={inputCls} value={form.role} onChange={(e) => set("role", e.target.value)}>
                  <option value="admin">Administrator</option>
                  <option value="pm">Project Manager</option>
                  <option value="foreman">Site Foreman</option>
                </select>
              </Field>
              <Field label="Status">
                <select className={inputCls} value={form.status} onChange={(e) => set("status", e.target.value)}>
                  <option value="Active">Active</option>
                  <option value="On leave">On leave</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Job title">
                <input required className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Project Coordinator" />
              </Field>
              <Field label="Phone">
                <input className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="416 739 0000" />
              </Field>
            </div>
            <Field label={editingId ? "New password" : "Password"}>
              <input
                type="password"
                className={inputCls}
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder={editingId ? "Leave blank to keep current password" : "Leave blank to auto-generate"}
                autoComplete="new-password"
              />
              {!editingId && (
                <p className="mt-1 font-mono text-[11px] text-concrete-400">
                  Auto-generated if left blank — shown once after saving.
                </p>
              )}
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
