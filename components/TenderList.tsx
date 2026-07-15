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

function fmt(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
}

function locationLine(t: PublicTender) {
  const cityProv = [t.city, t.province].filter(Boolean).join(", ");
  return [t.address, cityProv, t.postalCode].filter(Boolean).join(" · ") || "—";
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <span className="font-mono text-[10px] uppercase tracking-label text-concrete-400">{label}</span>
      <p className="mt-0.5 break-words text-sm text-ink">{value}</p>
    </div>
  );
}

function TenderCard({ t }: { t: PublicTender }) {
  const [showAll, setShowAll] = useState(false);
  const codes = t.codes ?? [];
  const shown = showAll ? codes : codes.slice(0, 6);
  const phoneFax = [t.contactPhone, t.contactFax && `Fax ${t.contactFax}`].filter(Boolean).join(" · ") || "—";

  return (
    <div className="rounded-xl border border-concrete-200 bg-white p-5 transition-shadow hover:shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-bold leading-snug tracking-tight text-ink">{t.title}</h3>
          <p className="mt-0.5 font-mono text-[11px] text-concrete-500">{t.ref}{t.org ? ` · ${t.org}` : ""}</p>
        </div>
        <StatusBadge status={t.status} />
      </div>

      <div className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
        <Detail label="Location" value={locationLine(t)} />
        <Detail label="Bid date" value={t.closing ? fmt(t.closing) : "No Due Date"} />
        <Detail label="Contact" value={t.contactName || "—"} />
        <Detail label="Phone / Fax" value={phoneFax} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-brand-50 px-2.5 py-1 font-mono text-[10px] uppercase tracking-label text-brand-700">{t.type}</span>
        <span className="rounded-full bg-concrete-100 px-2.5 py-1 font-mono text-[10px] uppercase tracking-label text-concrete-500">{t.category}</span>
        {t.bidUrl && (
          <a
            href={t.bidUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-brand-700 px-3 py-1.5 font-display text-xs font-semibold text-white transition-colors hover:bg-brand-800"
          >
            View bid package
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><path d="M15 3h6v6" /><path d="M10 14 21 3" />
            </svg>
          </a>
        )}
      </div>

      {codes.length > 0 && (
        <div className="mt-5 border-t border-concrete-100 pt-4">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-label text-concrete-500">Codes needed ({codes.length})</p>
          <div className="flex flex-wrap gap-1.5">
            {shown.map((c, i) => (
              <span key={i} className="rounded bg-concrete-100 px-2 py-1 font-mono text-[11px] text-concrete-600">{c}</span>
            ))}
            {codes.length > 6 && (
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="rounded bg-brand-50 px-2 py-1 font-mono text-[11px] font-semibold text-brand-700 hover:bg-brand-100"
              >
                {showAll ? "Show less" : `+${codes.length - 6} more`}
              </button>
            )}
          </div>
        </div>
      )}
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
      <div className="mb-8 space-y-4">
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
              ? "Check back soon — new bid opportunities are posted as they arise."
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
        <div className="space-y-4">
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
