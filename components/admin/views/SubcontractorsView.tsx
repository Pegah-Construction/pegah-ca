"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { PERMS } from "@/lib/admin";
import { StatCard, Card, THead, Table, Pill, SearchInput } from "../ui";

type Sub = {
  id: string; createdAt: string; status: string;
  companyName: string; phone: string; city: string; province: string;
  firstName: string; lastName: string; title: string; email: string;
  trades: string[]; isCOR: boolean; isWSIB: boolean; isBonded: boolean; isInsured: boolean;
  notes: string; website: string; fax: string; address: string; postalCode: string;
  contactPhone: string; mobile: string;
};

const STATUS_OPTIONS = ["New", "Approved", "Rejected"];
const tone = (s: string): "green" | "amber" | "gray" =>
  s === "Approved" ? "green" : s === "New" ? "amber" : "gray";

export default function SubcontractorsView() {
  const { user } = useAuth();
  const [subs, setSubs] = useState<Sub[]>([]);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Sub | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/subcontractors").then((r) => r.json()).then(setSubs);
  }, []);

  if (!user) return null;
  const perms = PERMS[user.role];

  const needle = q.trim().toLowerCase();
  const filtered = needle
    ? subs.filter((s) =>
        [s.companyName, s.firstName, s.lastName, s.email, s.city, s.province, ...s.trades]
          .some((v) => v.toLowerCase().includes(needle))
      )
    : subs;

  const total = subs.length;
  const approved = subs.filter((s) => s.status === "Approved").length;
  const pending = subs.filter((s) => s.status === "New").length;

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    await fetch(`/api/subcontractors/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setSubs((prev) => prev.map((s) => s.id === id ? { ...s, status } : s));
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, status } : prev);
    setUpdatingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this registration?")) return;
    await fetch(`/api/subcontractors/${id}`, { method: "DELETE" });
    setSubs((prev) => prev.filter((s) => s.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  return (
    <>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total registrations" value={total} hint="all time" />
        <StatCard label="Approved" value={approved} hint="in directory" />
        <StatCard label="Pending review" value={pending} hint="awaiting decision" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Card title="Registered subcontractors" right={
            <SearchInput value={q} onChange={setQ} placeholder="Search companies, trades…" />
          }>
            <Table>
              <THead cols={["Company", "Contact", "Trades", "Status", ""]} />
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-8 text-sm text-concrete-400">No registrations yet. Share the link at <span className="font-mono">/subcontractors/register</span>.</td></tr>
                )}
                {filtered.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => setSelected(s)}
                    className={`cursor-pointer border-b border-concrete-100 transition-colors last:border-0 hover:bg-brand-50/40 ${selected?.id === s.id ? "bg-brand-50/60" : ""}`}
                  >
                    <td className="px-5 py-3">
                      <div className="font-display font-semibold text-ink">{s.companyName}</div>
                      <div className="font-mono text-[11px] text-concrete-500">{s.city}, {s.province}</div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-sm text-ink">{s.firstName} {s.lastName}</div>
                      <div className="font-mono text-[11px] text-concrete-500">{s.email}</div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {s.trades.slice(0, 3).map((t) => (
                          <span key={t} className="rounded bg-concrete-100 px-1.5 py-0.5 font-mono text-[10px] text-concrete-500">Div.{t}</span>
                        ))}
                        {s.trades.length > 3 && (
                          <span className="rounded bg-concrete-100 px-1.5 py-0.5 font-mono text-[10px] text-concrete-400">+{s.trades.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3"><Pill text={s.status} tone={tone(s.status)} /></td>
                    <td className="px-5 py-3 text-right font-mono text-xs text-brand-700">→</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </div>

        {/* Detail panel */}
        <div>
          {selected ? (
            <div className="rounded-xl border border-concrete-200 bg-white">
              <div className="flex items-center justify-between border-b border-concrete-200 px-5 py-4">
                <h2 className="font-display text-sm font-bold text-ink">{selected.companyName}</h2>
                <button onClick={() => setSelected(null)} className="rounded p-1 text-concrete-400 hover:bg-concrete-100 hover:text-ink">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M18 6 6 18M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="divide-y divide-concrete-100 px-5 py-4 text-sm">
                <Fact k="Contact" v={`${selected.firstName} ${selected.lastName}${selected.title ? ` — ${selected.title}` : ""}`} />
                <Fact k="Email" v={selected.email} />
                {selected.phone && <Fact k="Phone" v={selected.phone} />}
                {selected.mobile && <Fact k="Mobile" v={selected.mobile} />}
                {selected.website && <Fact k="Website" v={selected.website} />}
                <Fact k="Address" v={[selected.address, selected.city, selected.province, selected.postalCode].filter(Boolean).join(", ")} />

                <div className="py-3">
                  <span className="font-mono text-[11px] uppercase tracking-label text-concrete-500">Trades</span>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {selected.trades.map((t) => (
                      <span key={t} className="rounded bg-brand-50 px-2 py-0.5 font-mono text-[11px] text-brand-700">Div. {t}</span>
                    ))}
                  </div>
                </div>

                <div className="py-3">
                  <span className="font-mono text-[11px] uppercase tracking-label text-concrete-500">Certifications</span>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {selected.isCOR && <Badge label="COR" />}
                    {selected.isWSIB && <Badge label="WSIB" />}
                    {selected.isBonded && <Badge label="Bonded" />}
                    {selected.isInsured && <Badge label="Insured ≥$2M" />}
                    {!selected.isCOR && !selected.isWSIB && !selected.isBonded && !selected.isInsured && (
                      <span className="text-xs text-concrete-400">None declared</span>
                    )}
                  </div>
                </div>

                {selected.notes && (
                  <div className="py-3">
                    <span className="font-mono text-[11px] uppercase tracking-label text-concrete-500">Notes</span>
                    <p className="mt-1.5 text-sm leading-relaxed text-concrete-600">{selected.notes}</p>
                  </div>
                )}

                {perms.manageTenders && (
                  <div className="pt-4">
                    <label className="font-mono text-[11px] uppercase tracking-label text-concrete-500">Status</label>
                    <div className="mt-2 flex gap-2">
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          disabled={!!updatingId || selected.status === opt}
                          onClick={() => updateStatus(selected.id, opt)}
                          className={`rounded-md px-3 py-1.5 font-display text-xs font-semibold transition-colors disabled:opacity-50 ${
                            selected.status === opt
                              ? "bg-brand-700 text-white"
                              : "border border-concrete-200 text-concrete-600 hover:border-brand-400 hover:text-brand-700"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => handleDelete(selected.id)}
                      className="mt-4 w-full rounded-md border border-red-200 py-2 font-display text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      Delete registration
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-concrete-200 text-sm text-concrete-400">
              Select a row to view details
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className="py-2.5">
      <span className="font-mono text-[11px] uppercase tracking-label text-concrete-500">{k}</span>
      <p className="mt-0.5 text-sm text-ink">{v}</p>
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-green-50 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-green-700 ring-1 ring-green-600/20">
      {label}
    </span>
  );
}
