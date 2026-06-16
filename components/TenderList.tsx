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
        <div className="py-16 text-center">
          <p className="font-body text-lg text-concrete-400">
            No tenders match your filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setQ("");
              setStatus("Active");
              setCategory("All");
            }}
            className="mt-4 font-mono text-xs uppercase tracking-label text-brand-700 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="divide-y divide-concrete-200 overflow-hidden rounded-xl border border-concrete-200 bg-white">
          {visible.map((t) => (
            <div
              key={t.id}
              className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:gap-6"
            >
              <StatusBadge status={t.status} />

              <div className="min-w-0 flex-1">
                <p className="font-display font-semibold leading-snug text-ink">
                  {t.title}
                </p>
                <p className="mt-0.5 font-mono text-[11px] text-concrete-500">
                  {t.ref} &middot; {t.org}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <span className="rounded-full bg-brand-50 px-2.5 py-1 font-mono text-[10px] uppercase tracking-label text-brand-700">
                  {t.type}
                </span>
                <span className="rounded-full bg-concrete-100 px-2.5 py-1 font-mono text-[10px] uppercase tracking-label text-concrete-500">
                  {t.category}
                </span>
              </div>

              <div className="shrink-0 sm:text-right">
                <p className="font-mono text-xs text-ink">
                  {t.city}, {t.province}
                </p>
                <p
                  className={`mt-0.5 font-mono text-[11px] ${
                    t.status === "Closing soon"
                      ? "font-semibold text-amber-600"
                      : "text-concrete-500"
                  }`}
                >
                  Closes {fmt(t.closing)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-3 font-mono text-[11px] text-concrete-400">
        Showing {visible.length} of {tenders.length} tenders
      </p>
    </div>
  );
}
