"use client";

import { useState, useEffect, useMemo } from "react";
import { money } from "@/lib/admin";
import { Card, Modal, Field, inputCls, Pill, Spinner } from "./ui";

type Sub = {
  id: string;
  companyName: string;
  city: string;
  province: string;
  email: string;
  trades: string[];
};

type Invitation = {
  id: string;
  subcontractorId: string;
  companyName: string;
  email: string;
  city: string;
  province: string;
  trades: string[];
  status: string;
};

type Bid = {
  id: string;
  subcontractorId: string;
  companyName: string;
  division: string;
  amount: number;
  note: string;
  status: string;
};

const INV_TONE: Record<string, "gray" | "blue" | "green" | "amber"> = {
  Invited: "gray",
  Viewed: "blue",
  Submitted: "green",
  Declined: "amber",
};

const BID_TONE: Record<string, "gray" | "blue" | "green" | "amber"> = {
  Received: "gray",
  Shortlisted: "blue",
  Awarded: "green",
  Rejected: "amber",
};

export default function BidManagement({ tenderId }: { tenderId: string }) {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteSearch, setInviteSearch] = useState("");
  const [inviteSel, setInviteSel] = useState<Set<string>>(new Set());
  const [inviting, setInviting] = useState(false);

  const [bidOpen, setBidOpen] = useState(false);
  const [bidForm, setBidForm] = useState({ subcontractorId: "", division: "", amount: "", note: "" });
  const [savingBid, setSavingBid] = useState(false);
  const [bidError, setBidError] = useState("");

  const load = () => {
    Promise.all([
      fetch("/api/subcontractors").then((r) => r.json()),
      fetch(`/api/tenders/${tenderId}/invitations`).then((r) => r.json()),
      fetch(`/api/tenders/${tenderId}/bids`).then((r) => r.json()),
    ]).then(([s, inv, b]) => {
      setSubs(Array.isArray(s) ? s : []);
      setInvitations(Array.isArray(inv) ? inv : []);
      setBids(Array.isArray(b) ? b : []);
      setLoading(false);
    });
  };
  useEffect(load, [tenderId]);

  const invitedIds = useMemo(() => new Set(invitations.map((i) => i.subcontractorId)), [invitations]);
  const lowest = bids.length ? Math.min(...bids.map((b) => b.amount)) : null;
  const awarded = bids.find((b) => b.status === "Awarded");

  // ── Invitations ──
  const openInvite = () => { setInviteSel(new Set()); setInviteSearch(""); setInviteOpen(true); };
  const toggleSel = (id: string) =>
    setInviteSel((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const sendInvites = async () => {
    if (inviteSel.size === 0) return;
    setInviting(true);
    await fetch(`/api/tenders/${tenderId}/invitations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subcontractorIds: [...inviteSel] }),
    });
    setInviting(false);
    setInviteOpen(false);
    load();
  };

  const removeInvitation = async (invId: string) => {
    setInvitations((prev) => prev.filter((i) => i.id !== invId));
    await fetch(`/api/tenders/${tenderId}/invitations/${invId}`, { method: "DELETE" });
  };

  const filteredSubs = useMemo(() => {
    const q = inviteSearch.trim().toLowerCase();
    return subs.filter((s) =>
      !q || [s.companyName, s.city, s.province, ...s.trades].some((v) => String(v).toLowerCase().includes(q))
    );
  }, [subs, inviteSearch]);

  // ── Bids ──
  const openBid = () => {
    setBidForm({ subcontractorId: invitations[0]?.subcontractorId ?? subs[0]?.id ?? "", division: "", amount: "", note: "" });
    setBidError("");
    setBidOpen(true);
  };

  const recordBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setBidError("");
    const amount = Number(bidForm.amount);
    if (!bidForm.subcontractorId) { setBidError("Select a subcontractor."); return; }
    if (!Number.isFinite(amount) || amount < 0) { setBidError("Enter a valid amount."); return; }
    setSavingBid(true);
    const res = await fetch(`/api/tenders/${tenderId}/bids`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...bidForm, amount }),
    });
    setSavingBid(false);
    if (res.ok) { setBidOpen(false); load(); }
    else { const d = await res.json().catch(() => ({})); setBidError(d.error ?? "Could not save the bid."); }
  };

  const setBidStatus = async (bidId: string, status: string) => {
    setBids((prev) => prev.map((b) => {
      if (b.id === bidId) return { ...b, status };
      if (status === "Awarded" && b.status === "Awarded") return { ...b, status: "Shortlisted" };
      return b;
    }));
    await fetch(`/api/tenders/${tenderId}/bids/${bidId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }),
    });
  };

  const deleteBid = async (bidId: string) => {
    if (!confirm("Delete this bid?")) return;
    setBids((prev) => prev.filter((b) => b.id !== bidId));
    await fetch(`/api/tenders/${tenderId}/bids/${bidId}`, { method: "DELETE" });
  };

  if (loading) {
    return (
      <Card title="Bid management">
        <div className="flex justify-center py-10"><Spinner className="h-6 w-6" /></div>
      </Card>
    );
  }

  return (
    <>
      <Card
        title="Bid management"
        right={
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={openInvite} className="rounded-md border border-concrete-200 bg-white px-3 py-1.5 font-display text-xs font-semibold text-ink hover:bg-concrete-50">
              + Invite subs
            </button>
            <button onClick={openBid} className="rounded-md bg-brand-700 px-3 py-1.5 font-display text-xs font-semibold text-white hover:bg-brand-800">
              + Record bid
            </button>
          </div>
        }
      >
        {/* Summary */}
        <div className="grid grid-cols-2 gap-px border-b border-concrete-200 bg-concrete-200 sm:grid-cols-4">
          {[
            { label: "Invited", value: String(invitations.length) },
            { label: "Bids in", value: String(bids.length) },
            { label: "Lowest bid", value: lowest !== null ? money(lowest) : "—" },
            { label: "Awarded", value: awarded ? awarded.companyName : "—" },
          ].map((s) => (
            <div key={s.label} className="bg-white px-4 py-3">
              <div className="truncate font-display text-sm font-bold text-ink">{s.value}</div>
              <div className="font-mono text-[10px] uppercase tracking-wide text-concrete-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Invitations */}
        <div className="border-b border-concrete-100 px-5 py-4">
          <h3 className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-wide text-concrete-500">
            Invited subcontractors ({invitations.length})
          </h3>
          {invitations.length === 0 ? (
            <p className="text-sm text-concrete-400">No one invited yet. Use “Invite subs” to select from your registered directory.</p>
          ) : (
            <ul className="divide-y divide-concrete-100">
              {invitations.map((inv) => (
                <li key={inv.id} className="flex items-center justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <div className="truncate font-display text-sm font-semibold text-ink">{inv.companyName}</div>
                    <div className="truncate font-mono text-[11px] text-concrete-400">{inv.city}, {inv.province} · {inv.trades.length} trade{inv.trades.length === 1 ? "" : "s"}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <Pill text={inv.status} tone={INV_TONE[inv.status] ?? "gray"} />
                    <button onClick={() => removeInvitation(inv.id)} title="Remove invitation" className="text-concrete-400 hover:text-red-600">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-3.5 w-3.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Bids comparison */}
        <div className="px-5 py-4">
          <h3 className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-wide text-concrete-500">
            Bids received ({bids.length})
          </h3>
          {bids.length === 0 ? (
            <p className="text-sm text-concrete-400">No bids recorded yet. As quotes come in, use “Record bid” to log and compare them.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-concrete-200 text-left">
                    {["Subcontractor", "Division", "Amount", "Status", ""].map((c) => (
                      <th key={c} className="py-2 pr-4 font-mono text-[10px] font-semibold uppercase tracking-wide text-concrete-500">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bids.map((b) => (
                    <tr key={b.id} className={`border-b border-concrete-100 last:border-0 ${b.status === "Awarded" ? "bg-green-50/60" : ""}`}>
                      <td className="py-2.5 pr-4">
                        <span className="font-display font-semibold text-ink">{b.companyName}</span>
                        {b.note && <span className="ml-2 font-mono text-[11px] text-concrete-400">{b.note}</span>}
                      </td>
                      <td className="py-2.5 pr-4 text-concrete-500">{b.division || "—"}</td>
                      <td className="py-2.5 pr-4">
                        <span className={`font-mono ${b.amount === lowest ? "font-bold text-green-700" : "text-ink"}`}>{money(b.amount)}</span>
                        {b.amount === lowest && <span className="ml-1.5 font-mono text-[10px] uppercase text-green-600">low</span>}
                      </td>
                      <td className="py-2.5 pr-4"><Pill text={b.status} tone={BID_TONE[b.status] ?? "gray"} /></td>
                      <td className="py-2.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {b.status !== "Awarded" && (
                            <button onClick={() => setBidStatus(b.id, "Awarded")} className="font-display text-xs font-semibold text-green-700 hover:text-green-800">Award</button>
                          )}
                          {b.status !== "Shortlisted" && b.status !== "Awarded" && (
                            <button onClick={() => setBidStatus(b.id, "Shortlisted")} className="font-display text-xs font-semibold text-brand-700 hover:text-brand-800">Shortlist</button>
                          )}
                          {b.status !== "Rejected" && (
                            <button onClick={() => setBidStatus(b.id, "Rejected")} className="font-display text-xs font-semibold text-concrete-500 hover:text-ink">Reject</button>
                          )}
                          <button onClick={() => deleteBid(b.id)} className="font-display text-xs font-semibold text-red-500 hover:text-red-600">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Invite modal */}
      {inviteOpen && (
        <Modal title="Invite subcontractors" onClose={() => setInviteOpen(false)}>
          <div className="space-y-4">
            <input
              type="search"
              value={inviteSearch}
              onChange={(e) => setInviteSearch(e.target.value)}
              placeholder="Search by company, city or trade…"
              className={inputCls}
            />
            {subs.length === 0 ? (
              <p className="py-6 text-center text-sm text-concrete-400">No registered subcontractors yet.</p>
            ) : (
              <div className="max-h-72 divide-y divide-concrete-100 overflow-y-auto rounded-lg border border-concrete-200">
                {filteredSubs.map((s) => {
                  const already = invitedIds.has(s.id);
                  const checked = inviteSel.has(s.id);
                  return (
                    <label key={s.id} className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 ${already ? "opacity-50" : "hover:bg-brand-50/50"}`}>
                      <input
                        type="checkbox"
                        disabled={already}
                        checked={checked}
                        onChange={() => toggleSel(s.id)}
                        className="h-4 w-4 shrink-0 rounded border-concrete-300 accent-brand-700"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-display text-sm font-semibold text-ink">{s.companyName}</span>
                        <span className="block truncate font-mono text-[11px] text-concrete-400">{s.city}, {s.province} · {s.trades.length} trade{s.trades.length === 1 ? "" : "s"}</span>
                      </span>
                      {already && <span className="shrink-0 font-mono text-[10px] uppercase text-concrete-400">Invited</span>}
                    </label>
                  );
                })}
                {filteredSubs.length === 0 && <p className="px-3 py-4 text-sm text-concrete-400">No matches.</p>}
              </div>
            )}
            <div className="flex justify-end gap-2 border-t border-concrete-100 pt-4">
              <button type="button" onClick={() => setInviteOpen(false)} className="rounded-md px-4 py-2 text-sm font-medium text-concrete-600 hover:text-ink">Cancel</button>
              <button type="button" onClick={sendInvites} disabled={inviting || inviteSel.size === 0} className="rounded-md bg-brand-700 px-4 py-2 font-display text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50">
                {inviting ? "Inviting…" : `Invite ${inviteSel.size || ""}`.trim()}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Record bid modal */}
      {bidOpen && (
        <Modal title="Record a bid" onClose={() => setBidOpen(false)}>
          <form onSubmit={recordBid} className="space-y-4">
            <Field label="Subcontractor">
              <select
                className={inputCls}
                value={bidForm.subcontractorId}
                onChange={(e) => setBidForm((f) => ({ ...f, subcontractorId: e.target.value }))}
              >
                <option value="">Select…</option>
                {invitations.length > 0 && (
                  <optgroup label="Invited">
                    {invitations.map((i) => <option key={i.subcontractorId} value={i.subcontractorId}>{i.companyName}</option>)}
                  </optgroup>
                )}
                <optgroup label="All registered">
                  {subs.map((s) => <option key={s.id} value={s.id}>{s.companyName}</option>)}
                </optgroup>
              </select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Division / trade">
                <input className={inputCls} value={bidForm.division} onChange={(e) => setBidForm((f) => ({ ...f, division: e.target.value }))} placeholder="e.g. 22 — Plumbing" />
              </Field>
              <Field label="Amount ($)">
                <input required type="number" min="0" step="0.01" className={inputCls} value={bidForm.amount} onChange={(e) => setBidForm((f) => ({ ...f, amount: e.target.value }))} placeholder="e.g. 125000" />
              </Field>
            </div>
            <Field label="Note (optional)">
              <input className={inputCls} value={bidForm.note} onChange={(e) => setBidForm((f) => ({ ...f, note: e.target.value }))} placeholder="e.g. excludes permits" />
            </Field>
            {bidError && <p className="rounded-md bg-red-50 px-4 py-2.5 text-sm text-red-600">{bidError}</p>}
            <div className="flex justify-end gap-2 border-t border-concrete-100 pt-4">
              <button type="button" onClick={() => setBidOpen(false)} className="rounded-md px-4 py-2 text-sm font-medium text-concrete-600 hover:text-ink">Cancel</button>
              <button type="submit" disabled={savingBid} className="rounded-md bg-brand-700 px-4 py-2 font-display text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50">
                {savingBid ? "Saving…" : "Record bid"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
