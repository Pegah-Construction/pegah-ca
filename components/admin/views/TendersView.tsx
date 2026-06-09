"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { TENDERS, TENDER_PLATFORMS, STATS, money, type Tender } from "@/lib/admin";
import { StatCard, Card, THead, Table, Pill } from "../ui";

export default function TendersView() {
  const { user } = useAuth();
  const [platform, setPlatform] = useState("All");
  const [status, setStatus] = useState("All");
  const [tenders, setTenders] = useState<Tender[]>(TENDERS);
  if (!user) return null;

  const list = tenders.filter(
    (t) => (platform === "All" || t.platform === platform) && (status === "All" || t.status === status)
  );
  const open = tenders.filter((t) => t.status === "Open").length;
  const soon = tenders.filter((t) => t.status === "Closing soon").length;
  const tracked = tenders.filter((t) => t.tracked).length;
  const totVal = tenders.reduce((a, t) => a + (t.value || 0), 0);

  const toggleTrack = (id: string) =>
    setTenders((prev) => prev.map((t) => (t.id === id ? { ...t, tracked: !t.tracked } : t)));

  const tone = (s: string): "green" | "amber" | "gray" => (s === "Open" ? "green" : s === "Closing soon" ? "amber" : "gray");

  return (
    <>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open" value={open} hint="live opportunities" />
        <StatCard label="Closing soon" value={soon} hint="within 14 days" />
        <StatCard label="Tracked" value={tracked} hint="bookmarked by your team" />
        <StatCard label="Pipeline value" value={money(totVal)} hint="across all sources" />
      </div>

      <p className="mb-4 text-sm text-concrete-500">
        Aggregated from {TENDER_PLATFORMS.length} procurement platforms · {STATS.tenders} tenders in database{" "}
        <span className="ml-1 rounded bg-amber-50 px-1.5 py-0.5 font-mono text-[10px] text-amber-700 ring-1 ring-amber-600/20">scraper demo</span>
      </p>

      <div className="mb-4 space-y-2">
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
                <td className="px-5 py-3"><Pill text={t.status} tone={tone(t.status)} /></td>
                <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => toggleTrack(t.id)}
                    className={`rounded-md border px-2.5 py-1 font-display text-xs font-semibold ${t.tracked ? "border-brand-600 bg-brand-50 text-brand-700" : "border-concrete-300 text-concrete-500 hover:border-brand-400"}`}>
                    {t.tracked ? "★ Tracked" : "☆ Track"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </>
  );
}
