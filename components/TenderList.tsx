"use client";

import { useState } from "react";

export type PublicTender = {
  id: string;
  ref: string;
  title: string;
  org: string;
  type: string;
  category: string;
  province: string;
  city: string;
  closing: string;
  status: string;
  address: string;
  postalCode: string;
  contactName: string;
  contactPhone: string;
  contactFax: string;
  codes: string[];
  bidUrl: string;
};

const STATUS_STYLE: Record<string, string> = {
  "Open": "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
  "Closing soon": "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
  "Closed": "bg-concrete-100 text-concrete-500 ring-1 ring-concrete-200",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-label ${STATUS_STYLE[status] ?? STATUS_STYLE["Closed"]}`}
    >
      {status}
    </span>
  );
}

// Closing date, with a time when the stored value has one (e.g. "July 22, 2026 @ 2:00 PM").
function fmtClosing(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const date = d.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
  const hasTime = /T\d{2}:\d{2}/.test(iso) && !/T00:00(:00)?/.test(iso);
  if (!hasTime) return date;
  const time = d.toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit" });
  return `${date} @ ${time}`;
}

function TenderCard({ t }: { t: PublicTender }) {
  const sub = [t.org, [t.city, t.province].filter(Boolean).join(", ")].filter(Boolean).join(" · ");
  return (
    <div className="flex h-full flex-col rounded-xl border border-concrete-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md">
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <span className="truncate font-mono text-[10px] uppercase tracking-label text-concrete-400">{t.ref}</span>
        <StatusBadge status={t.status} />
      </div>
      <h3 className="font-display text-base font-bold leading-snug tracking-tight text-ink">
        {t.bidUrl ? (
          <a
            href={t.bidUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-brand-700"
          >
            {t.title}
          </a>
        ) : (
          t.title
        )}
      </h3>
      {sub && <p className="mt-1.5 text-sm leading-snug text-concrete-500">{sub}</p>}
      <div className="mt-auto flex items-center gap-1.5 pt-6 text-sm text-concrete-600">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 shrink-0 text-concrete-400">
          <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
        <span className="font-semibold text-ink">
          {t.closing ? fmtClosing(t.closing) : "No due date"}
        </span>
      </div>
    </div>
  );
}

const STATUSES = ["Active", "Open", "Closing soon", "Closed", "All"] as const;

export default function TenderList({ tenders }: { tenders: PublicTender[] }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("Active");
  const [category, setCategory] = useState("All");

  const categories = [
    "All",
    ...Array.from(new Set(tenders.map((t) => t.category))).sort(),
  ];

  const needle = q.trim().toLowerCase();
  const visible = tenders
    .filter((t) => {
      if (status === "Active") return t.status === "Open" || t.status === "Closing soon";
      if (status === "All") return true;
      return t.status === status;
    })
    .filter((t) => category === "All" || t.category === category)
    .filter(
      (t) =>
        !needle ||
        [t.title, t.ref, t.org, t.type, t.category, t.city].some((v) =>
          v.toLowerCase().includes(needle)
        )
    );

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 space-y-3">
        <div className="relative max-w-sm">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-concrete-400"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4-4" />
          </svg>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title, reference, or city…"
            className="w-full rounded-md border border-concrete-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-label text-concrete-500">
            Status
          </span>
          {STATUSES.map((s) => {
            const on = s === status;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-label transition-colors ${
                  on
                    ? "bg-brand-700 text-white"
                    : "border border-concrete-300 text-concrete-500 hover:border-brand-400 hover:text-brand-700"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-label text-concrete-500">
            Category
          </span>
          {categories.map((c) => {
            const on = c === category;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-label transition-colors ${
                  on
                    ? "bg-ink text-white"
                    : "border border-concrete-300 text-concrete-500 hover:border-ink/40 hover:text-ink"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results */}
      {visible.length === 0 ? (
        <div className="rounded-xl border border-concrete-200 bg-white px-8 py-20 text-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="mx-auto h-10 w-10 text-concrete-300">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6M9 13h6M9 17h6" />
          </svg>
          <p className="mt-5 font-display text-lg font-semibold text-ink">
            {tenders.length === 0
              ? "No active tenders at this time"
              : "No tenders match your filters"}
          </p>
          <p className="mt-2 text-sm text-concrete-400">
            {tenders.length === 0
              ? "Check back soon. New bid opportunities are posted as they arise."
              : "Try adjusting the status or category filters."}
          </p>
          {tenders.length > 0 && (
            <button
              type="button"
              onClick={() => { setQ(""); setStatus("Active"); setCategory("All"); }}
              className="mt-5 rounded-md border border-concrete-300 px-4 py-2 font-mono text-xs uppercase tracking-label text-concrete-500 transition-colors hover:border-brand-400 hover:text-brand-700"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((t) => (
            <TenderCard key={t.id} t={t} />
          ))}
        </div>
      )}

      <p className="mt-3 font-mono text-[11px] text-concrete-400">
        Showing {visible.length} of {tenders.length} tenders
      </p>
    </div>
  );
}
