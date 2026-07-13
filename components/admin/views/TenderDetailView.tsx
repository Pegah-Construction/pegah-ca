"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { money, type Tender } from "@/lib/admin";
import { StatCard, Card, Pill, Modal, Field, inputCls } from "../ui";

const TYPES = ["ITT", "RFP", "RFQ", "EOI", "RFPQ"];
const STATUSES = ["Open", "Closing soon", "Closed"] as const;
const CATEGORIES = ["Commercial","Industrial","Residential","Transportation","Recreational","Retail","Historical","Institutional"];

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 py-3">
      <dt className="text-sm text-concrete-500">{k}</dt>
      <dd className="text-right font-display text-sm font-semibold text-ink">{v}</dd>
    </div>
  );
}

export default function TenderDetailView({ id }: { id: string }) {
  const [tender, setTender] = useState<Tender | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", ref: "", org: "", platform: "", type: "ITT", category: "Commercial",
    value: "", province: "", city: "", published: "", closing: "", status: "Open" as Tender["status"],
    desc: "", note: "", contactName: "", contactEmail: "", contactPhone: "",
  });

  useEffect(() => {
    fetch(`/api/tenders/${id}`)
      .then((r) => { if (r.status === 404) { setNotFound(true); return null; } return r.json(); })
      .then((data) => { if (data) setTender(data); });
  }, [id]);

  if (notFound) return null;
  if (!tender) return null;

  const t = tender;
  const tone = t.status === "Open" ? "green" : t.status === "Closing soon" ? "amber" : "gray";
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const openEdit = () => {
    setForm({
      title: t.title, ref: t.ref, org: t.org, platform: t.platform,
      type: t.type, category: t.category, value: String(t.value),
      province: t.province, city: t.city, published: t.published, closing: t.closing,
      status: t.status, desc: t.desc, note: t.note ?? "",
      contactName: t.contact.name, contactEmail: t.contact.email, contactPhone: t.contact.phone,
    });
    setEditOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/tenders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const updated = await res.json();
    setTender(updated);
    setEditOpen(false);
    setSaving(false);
  };

  return (
    <>
      <div className="mb-6">
        <Link href="/admin/tenders" className="font-mono text-xs text-concrete-500 hover:text-brand-700">← All tenders</Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h2 className="font-display text-2xl font-black tracking-tight text-ink">{t.title}</h2>
          <Pill text={t.status} tone={tone} />
          <button onClick={openEdit} className="ml-auto rounded-md border border-concrete-200 bg-white px-3 py-1.5 font-display text-xs font-semibold text-ink hover:bg-concrete-50">
            Edit tender
          </button>
        </div>
        <p className="mt-1 font-mono text-xs text-concrete-500">{t.ref} · {t.org} · {t.platform}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Est. value" value={money(t.value)} />
        <StatCard label="Type" value={t.type} />
        <StatCard label="Closing" value={t.closing} />
        <StatCard label="Location" value={`${t.city}, ${t.province}`} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="min-w-0 space-y-6 xl:col-span-2">
          <Card title="Description">
            <div className="px-5 py-5 leading-relaxed text-concrete-600">{t.desc}</div>
          </Card>
          <Card title="Your notes">
            <div className="px-5 py-5">
              {t.note ? <p className="rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-800">{t.note}</p> : <p className="text-sm text-concrete-400">No notes yet.</p>}
            </div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card title="Buyer contact">
            <dl className="divide-y divide-concrete-100 px-5">
              <Fact k="Name" v={t.contact.name} />
              <Fact k="Email" v={t.contact.email} />
              <Fact k="Phone" v={t.contact.phone} />
            </dl>
          </Card>
          <Card title="Details">
            <dl className="divide-y divide-concrete-100 px-5">
              <Fact k="Reference" v={t.ref} />
              <Fact k="Category" v={t.category} />
              <Fact k="Published" v={t.published} />
              <Fact k="Closing" v={t.closing} />
            </dl>
          </Card>
        </div>
      </div>

      {editOpen && (
        <Modal title="Edit tender" onClose={() => setEditOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Title">
              <input required className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Reference #">
                <input required className={inputCls} value={form.ref} onChange={(e) => set("ref", e.target.value)} />
              </Field>
              <Field label="Status">
                <select className={inputCls} value={form.status} onChange={(e) => set("status", e.target.value)}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Organization">
                <input required className={inputCls} value={form.org} onChange={(e) => set("org", e.target.value)} />
              </Field>
              <Field label="Platform">
                <input required className={inputCls} value={form.platform} onChange={(e) => set("platform", e.target.value)} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Type">
                <select className={inputCls} value={form.type} onChange={(e) => set("type", e.target.value)}>
                  {TYPES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Category">
                <select className={inputCls} value={form.category} onChange={(e) => set("category", e.target.value)}>
                  {CATEGORIES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Est. value ($)">
                <input required type="number" min="0" className={inputCls} value={form.value} onChange={(e) => set("value", e.target.value)} />
              </Field>
              <Field label="City">
                <input required className={inputCls} value={form.city} onChange={(e) => set("city", e.target.value)} />
              </Field>
              <Field label="Province">
                <input required className={inputCls} value={form.province} onChange={(e) => set("province", e.target.value)} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Published">
                <input required className={inputCls} value={form.published} onChange={(e) => set("published", e.target.value)} placeholder="YYYY-MM-DD" />
              </Field>
              <Field label="Closing">
                <input required className={inputCls} value={form.closing} onChange={(e) => set("closing", e.target.value)} placeholder="YYYY-MM-DD" />
              </Field>
            </div>
            <Field label="Description">
              <textarea rows={3} className={inputCls} value={form.desc} onChange={(e) => set("desc", e.target.value)} />
            </Field>
            <Field label="Notes">
              <textarea rows={2} className={inputCls} value={form.note} onChange={(e) => set("note", e.target.value)} placeholder="Internal notes about this tender…" />
            </Field>
            <fieldset className="space-y-3 rounded-lg border border-concrete-200 px-4 pb-4 pt-3">
              <legend className="px-1 font-mono text-[11px] font-semibold uppercase tracking-wide text-concrete-500">Buyer contact</legend>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Name">
                  <input className={inputCls} value={form.contactName} onChange={(e) => set("contactName", e.target.value)} />
                </Field>
                <Field label="Email">
                  <input type="email" className={inputCls} value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} />
                </Field>
                <Field label="Phone">
                  <input className={inputCls} value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} />
                </Field>
              </div>
            </fieldset>
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
