"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { TENDER_PLATFORMS, PERMS, money, type Tender } from "@/lib/admin";
import { StatCard, Card, THead, Table, Pill, SearchInput } from "../ui";

// ── Subcontractor types ────────────────────────────────────────────────────────

type Sub = {
  id: string; createdAt: string; status: string;
  companyName: string; phone: string; city: string; province: string;
  firstName: string; lastName: string; title: string; email: string;
  trades: string[]; isCOR: boolean; isWSIB: boolean; isBonded: boolean; isInsured: boolean;
  notes: string; website: string; fax: string; address: string; postalCode: string;
  contactPhone: string; mobile: string;
};

const STATUS_OPTIONS = ["New", "Approved", "Rejected"];
const subTone = (s: string): "green" | "amber" | "gray" =>
  s === "Approved" ? "green" : s === "New" ? "amber" : "gray";

function SubFact({ k, v }: { k: string; v: string }) {
  return (
    <div className="py-2.5">
      <span className="font-mono text-[11px] uppercase tracking-label text-concrete-500">{k}</span>
      <p className="mt-0.5 text-sm text-ink">{v}</p>
    </div>
  );
}

function CertBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-green-50 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-green-700 ring-1 ring-green-600/20">
      {label}
    </span>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

type Tab = "tenders" | "subcontractors";

export default function TendersView() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("tenders");

  // tenders state
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [platform, setPlatform] = useState("All");
  const [status, setStatus] = useState("All");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [q, setQ] = useState("");

  // subcontractors state
  const [subs, setSubs] = useState<Sub[]>([]);
  const [subQ, setSubQ] = useState("");
  const [selected, setSelected] = useState<Sub | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/tenders").then((r) => r.json()).then(setTenders);
    fetch("/api/subcontractors").then((r) => r.json()).then(setSubs);
  }, []);

  if (!user) return null;
  const perms = PERMS[user.role];

  // ── Tenders logic ────────────────────────────────────────────────────────────
  const needle = q.trim().toLowerCase();
  const list = tenders.filter(
    (t) =>
      (platform === "All" || t.platform === platform) &&
      (status === "All" || t.status === status) &&
      (!needle || [t.title, t.ref, t.org, t.type, t.category].some((v) => v.toLowerCase().includes(needle)))
  );
  const open = tenders.filter((t) => t.status === "Open").length;
  const soon = tenders.filter((t) => t.status === "Closing soon").length;
  const tracked = tenders.filter((t) => t.tracked).length;
  const totVal = tenders.reduce((a, t) => a + (t.value || 0), 0);

  const toggleTrack = async (id: string) => {
    const tender = tenders.find((t) => t.id === id);
    if (!tender || togglingId) return;
    setTogglingId(id);
    const updated = { ...tender, tracked: !tender.tracked };
    setTenders((prev) => prev.map((t) => (t.id === id ? updated : t)));
    await fetch(`/api/tenders/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tracked: updated.tracked }),
    });
    setTogglingId(null);
  };

  const tenderTone = (s: string): "green" | "amber" | "gray" =>
    s === "Open" ? "green" : s === "Closing soon" ? "amber" : "gray";

  // ── Subcontractors logic ──────────────────────────────────────────────────────
  const subNeedle = subQ.trim().toLowerCase();
  const filteredSubs = subNeedle
    ? subs.filter((s) =>
        [s.companyName, s.firstName, s.lastName, s.email, s.city, s.province, ...s.trades]
          .some((v) => v.toLowerCase().includes(subNeedle))
      )
    : subs;

  const updateSubStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    await fetch(`/api/subcontractors/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setSubs((prev) => prev.map((s) => s.id === id ? { ...s, status: newStatus } : s));
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, status: newStatus } : prev);
    setUpdatingId(null);
  };

  const deleteSub = async (id: string) => {
    if (!confirm("Delete this registration?")) return;
    await fetch(`/api/subcontractors/${id}`, { method: "DELETE" });
    setSubs((prev) => prev.filter((s) => s.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const subApproved = subs.filter((s) => s.status === "Approved").length;
  const subPending = subs.filter((s) => s.status === "New").length;

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Tab switcher */}
      <div className="mb-6 flex gap-1 rounded-lg border border-concrete-200 bg-white p-1 w-fit">
        {(["tenders", "subcontractors"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-4 py-1.5 font-display text-sm font-semibold transition-colors capitalize ${
              tab === t ? "bg-brand-700 text-white" : "text-concrete-500 hover:text-ink"
            }`}
          >
            {t === "subcontractors" ? `Subcontractors${subs.length ? ` (${subs.length})` : ""}` : "Tenders"}
          </button>
        ))}
      </div>

      {/* ── Tenders tab ─────────────────────────────────────────────────────── */}
      {tab === "tenders" && (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Open" value={open} hint="live opportunities" />
            <StatCard label="Closing soon" value={soon} hint="within 14 days" />
            <StatCard label="Tracked" value={tracked} hint="bookmarked by your team" />
            <StatCard label="Pipeline value" value={money(totVal)} hint="across all sources" />
          </div>

          <p className="mb-4 text-sm text-concrete-500">
            Aggregated from {TENDER_PLATFORMS.length} procurement platforms · {tenders.length} tenders in database{" "}
            <span className="ml-1 rounded bg-amber-50 px-1.5 py-0.5 font-mono text-[10px] text-amber-700 ring-1 ring-amber-600/20">scraper demo</span>
          </p>

          <div className="mb-4 space-y-2">
            <SearchInput value={q} onChange={setQ} placeholder="Search tenders…" />
            <div className="flex flex-wrap gap-2">
              {["All", ...TENDER_PLATFORMS].map((pl) => (
                <button key={pl} onClick={() => setPlatform(pl)}
                  className={`rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide transition-colors ${platform === pl ? "bg-brand-700 text-white" : "border border-concrete-300 text-concrete-500 hover:border-brand-400 hover:text-brand-700"}`}>
                  {pl}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {["All", "Open", "Closing soon", "Closed"].map((s) => (
                <button key={s} onClick={() => setStatus(s)}
                  className={`rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide transition-colors ${status === s ? "bg-ink text-white" : "border border-concrete-300 text-concrete-500 hover:border-ink/40 hover:text-ink"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <Card title="Tender opportunities">
            <Table>
              <THead cols={["Opportunity", "Platform", "Type", "Est. value", "Closing", "Status", ""]} />
              <tbody>
                {list.map((t) => (
                  <tr key={t.id} onClick={() => (location.href = `/admin/tenders/${t.id}`)} className="cursor-pointer border-b border-concrete-100 transition-colors last:border-0 hover:bg-brand-50/40">
                    <td className="px-5 py-3"><div className="font-display font-semibold text-ink">{t.title}</div><div className="font-mono text-[11px] text-concrete-500">{t.ref} · {t.org}</div></td>
                    <td className="px-5 py-3"><Pill text={t.platform} /></td>
                    <td className="px-5 py-3"><Pill text={t.type} tone="blue" /></td>
                    <td className="px-5 py-3 font-mono text-xs text-concrete-500">{money(t.value)}</td>
                    <td className={`px-5 py-3 font-mono text-xs ${t.status === "Closing soon" ? "text-red-600" : "text-concrete-500"}`}>{t.closing}</td>
                    <td className="px-5 py-3"><Pill text={t.status} tone={tenderTone(t.status)} /></td>
                    <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => toggleTrack(t.id)} disabled={!!togglingId}
                        className={`rounded-md border px-2.5 py-1 font-display text-xs font-semibold transition-opacity disabled:opacity-50 ${t.tracked ? "border-brand-600 bg-brand-50 text-brand-700" : "border-concrete-300 text-concrete-500 hover:border-brand-400"}`}>
                        {togglingId === t.id ? "…" : t.tracked ? "★ Tracked" : "☆ Track"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </>
      )}

      {/* ── Subcontractors tab ───────────────────────────────────────────────── */}
      {tab === "subcontractors" && (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <StatCard label="Total registrations" value={subs.length} hint="all time" />
            <StatCard label="Approved" value={subApproved} hint="in directory" />
            <StatCard label="Pending review" value={subPending} hint="awaiting decision" />
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <Card
                title="Registered subcontractors"
                right={<SearchInput value={subQ} onChange={setSubQ} placeholder="Search companies, trades…" />}
              >
                <Table>
                  <THead cols={["Company", "Contact", "Trades", "Status", ""]} />
                  <tbody>
                    {filteredSubs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-sm text-concrete-400">
                          No registrations yet. Share <span className="font-mono">/subcontractors/register</span> with prospective subcontractors.
                        </td>
                      </tr>
                    )}
                    {filteredSubs.map((s) => (
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
                        <td className="px-5 py-3"><Pill text={s.status} tone={subTone(s.status)} /></td>
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
                    <SubFact k="Contact" v={`${selected.firstName} ${selected.lastName}${selected.title ? ` — ${selected.title}` : ""}`} />
                    <SubFact k="Email" v={selected.email} />
                    {selected.phone && <SubFact k="Phone" v={selected.phone} />}
                    {selected.mobile && <SubFact k="Mobile" v={selected.mobile} />}
                    {selected.website && <SubFact k="Website" v={selected.website} />}
                    <SubFact k="Address" v={[selected.address, selected.city, selected.province, selected.postalCode].filter(Boolean).join(", ")} />

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
                        {selected.isCOR && <CertBadge label="COR" />}
                        {selected.isWSIB && <CertBadge label="WSIB" />}
                        {selected.isBonded && <CertBadge label="Bonded" />}
                        {selected.isInsured && <CertBadge label="Insured ≥$2M" />}
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
                        <span className="font-mono text-[11px] uppercase tracking-label text-concrete-500">Status</span>
                        <div className="mt-2 flex gap-2">
                          {STATUS_OPTIONS.map((opt) => (
                            <button
                              key={opt}
                              disabled={!!updatingId || selected.status === opt}
                              onClick={() => updateSubStatus(selected.id, opt)}
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
                          onClick={() => deleteSub(selected.id)}
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
      )}
    </>
  );
}
