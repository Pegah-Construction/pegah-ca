"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { PERMS, money, type Tender } from "@/lib/admin";
import { StatCard, Card, THead, Table, Pill, SearchInput } from "../ui";

export default function TendersView() {
  const { user } = useAuth();
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [status, setStatus] = useState("All");
  const [q, setQ] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tenders")
      .then((r) => r.json())
      .then((d) => setTenders(d))
      .finally(() => setLoading(false));
  }, []);

  if (!user) return null;
  const perms = PERMS[user.role];

  const runSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/tenders/sync", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "SmartBid sync failed.");
        return;
      }
      const fresh = await fetch("/api/tenders").then((r) => r.json());
      setTenders(fresh);
      alert(`SmartBid sync complete: ${data.created} added, ${data.updated} updated (${data.total} total).`);
    } catch {
      alert("SmartBid sync failed. Please try again.");
    } finally {
      setSyncing(false);
    }
  };

  const needle = q.trim().toLowerCase();
  const list = tenders.filter(
    (t) =>
      (status === "All" || t.status === status) &&
      (!needle || [t.title, t.ref, t.org, t.type, t.category].some((v) => v.toLowerCase().includes(needle)))
  );
  const open = tenders.filter((t) => t.status === "Open").length;
  const soon = tenders.filter((t) => t.status === "Closing soon").length;
  const totVal = tenders.reduce((a, t) => a + (t.value || 0), 0);

  const tenderTone = (s: string): "green" | "amber" | "gray" =>
    s === "Open" ? "green" : s === "Closing soon" ? "amber" : "gray";

  return (
    <>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Open" value={open} hint="live opportunities" />
        <StatCard label="Closing soon" value={soon} hint="within 14 days" />
        <StatCard label="Pipeline value" value={money(totVal)} hint="across all tenders" />
      </div>

      <p className="mb-4 text-sm text-concrete-500">
        Synced from SmartBid · {tenders.length} tender{tenders.length === 1 ? "" : "s"} in the database. The full bid
        package, subcontractor invitations and bids are managed in SmartBid.
      </p>

      <div className="mb-4 space-y-2">
        <SearchInput value={q} onChange={setQ} placeholder="Search tenders…" />
        <div className="flex flex-wrap gap-2">
          {["All", "Open", "Closing soon", "Closed"].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide transition-colors ${
                status === s
                  ? "bg-ink text-white"
                  : "border border-concrete-300 text-concrete-500 hover:border-ink/40 hover:text-ink"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <Card
        title="Tender opportunities"
        right={
          perms.manageTenders && (
            <button
              onClick={runSync}
              disabled={syncing}
              className="rounded-md border border-concrete-300 bg-white px-4 py-2 font-display text-sm font-semibold text-ink transition-colors hover:bg-concrete-50 disabled:opacity-60"
            >
              {syncing ? "Syncing…" : "Sync from SmartBid"}
            </button>
          )
        }
      >
        <Table>
          <THead cols={["Opportunity", "Platform", "Type", "Est. value", "Closing", "Status"]} />
          <tbody>
            {list.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-sm text-concrete-400">
                  {loading
                    ? "Loading…"
                    : tenders.length === 0
                      ? "No tenders yet. Click “Sync from SmartBid” to import bid opportunities."
                      : "No tenders match your filters."}
                </td>
              </tr>
            )}
            {list.map((t) => (
              <tr key={t.id} className="border-b border-concrete-100 transition-colors last:border-0 hover:bg-brand-50/40">
                <td className="px-5 py-3">
                  <div className="font-display font-semibold text-ink">
                    {t.bidUrl ? (
                      <a href={t.bidUrl} target="_blank" rel="noopener noreferrer" className="hover:text-brand-700 hover:underline">
                        {t.title}
                      </a>
                    ) : (
                      t.title
                    )}
                  </div>
                  <div className="font-mono text-[11px] text-concrete-500">
                    {t.ref}
                    {t.org ? ` · ${t.org}` : ""}
                  </div>
                </td>
                <td className="px-5 py-3"><Pill text={t.platform} /></td>
                <td className="px-5 py-3"><Pill text={t.type} tone="blue" /></td>
                <td className="px-5 py-3 font-mono text-xs text-concrete-500">{t.value > 0 ? money(t.value) : "—"}</td>
                <td className={`px-5 py-3 font-mono text-xs ${t.status === "Closing soon" ? "text-red-600" : "text-concrete-500"}`}>
                  {t.closing || "—"}
                </td>
                <td className="px-5 py-3"><Pill text={t.status} tone={tenderTone(t.status)} /></td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </>
  );
}
