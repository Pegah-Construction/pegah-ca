"use client";

import { useState } from "react";
import { tenderGroupOf } from "@/lib/tender-group";

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
  squareFootage: number;
  contactName: string;
  contactEmail: string;
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

// The feed reports a postal range, which for a single address is the same code
// twice ("N2L 0K2-N2L 0K2"). Collapse that; leave a genuine range alone.
function fmtPostal(zip: string) {
  const [a, b, ...rest] = zip.split("-").map((s) => s.trim());
  return b && !rest.length && a === b ? a : zip;
}

// Floor area, e.g. 142752 → "142,752 sq ft". 0 means the feed didn't say.
const fmtSqft = (n: number) => (n > 0 ? `${n.toLocaleString("en-CA")} sq ft` : "");

// Phone numbers arrive with an extension ("(416) 739-9300 x231"), which has to
// stay out of the dialled digits or the call fails — tel: carries it separately.
function telHref(phone: string) {
  const [main, ext] = phone.split(/\s*(?:x|ext\.?|extension)\s*/i);
  const digits = main.replace(/[^\d+]/g, "");
  return `tel:${digits}${ext ? `;ext=${ext.replace(/\D/g, "")}` : ""}`;
}

// A CSI line is "03100 - Concrete Forms And Accessories"; the number alone is
// what a trade scans for, so it's split out and shown in bold.
function splitCode(entry: string): [string, string] {
  const m = entry.match(/^\s*([\w.-]+)\s*[-–—]\s*(.+)$/);
  return m ? [m[1], m[2]] : ["", entry.trim()];
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

/** One labelled row of the card's detail list: icon, then value. */
function DetailRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-sm leading-snug text-concrete-600">
      <span className="mt-0.5 shrink-0 text-concrete-400">{icon}</span>
      <span className="min-w-0">{children}</span>
    </div>
  );
}

const ICON = "h-4 w-4 shrink-0";

/**
 * Trade divisions. A bid can carry a few or a few dozen CSI codes, so the list
 * opens at six and expands in place — long enough for a trade to recognise its
 * own work, short enough that the cards stay the same height.
 */
function TradeCodes({ codes }: { codes: string[] }) {
  const [open, setOpen] = useState(false);
  const INITIAL = 6;
  const shown = open ? codes : codes.slice(0, INITIAL);
  const hidden = codes.length - shown.length;

  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-label text-concrete-400">
        Trade divisions <span className="text-concrete-300">({codes.length})</span>
      </p>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {shown.map((entry, i) => {
          const [code, label] = splitCode(entry);
          return (
            <li
              key={`${code}-${i}`}
              title={entry}
              className="inline-flex max-w-full items-baseline gap-1.5 rounded-md bg-concrete-100 px-2 py-1 text-[11px] text-concrete-600"
            >
              {code && <span className="shrink-0 font-mono font-semibold text-ink">{code}</span>}
              <span className="truncate">{label}</span>
            </li>
          );
        })}
      </ul>
      {(hidden > 0 || open) && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="mt-2 font-mono text-[11px] uppercase tracking-label text-accent-700 transition-colors hover:text-brand-700"
        >
          {open ? "Show fewer" : `+${hidden} more`}
        </button>
      )}
    </div>
  );
}

function TenderCard({ t }: { t: PublicTender }) {
  const site = [t.address, t.city, t.province, fmtPostal(t.postalCode)].filter(Boolean).join(", ");
  const sqft = fmtSqft(t.squareFootage);

  return (
    <div className="flex h-full flex-col rounded-xl border border-concrete-200 bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md">
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
      {t.org && <p className="mt-1.5 text-sm leading-snug text-concrete-500">{t.org}</p>}

      {/* Project type and size — the two things that size up a bid at a glance. */}
      {(t.type || sqft) && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {t.type && (
            <span className="inline-flex rounded-full bg-brand-50 px-2.5 py-1 font-mono text-[10px] uppercase tracking-label text-accent-700">
              {t.type}
            </span>
          )}
          {sqft && (
            <span className="inline-flex rounded-full bg-concrete-100 px-2.5 py-1 font-mono text-[10px] uppercase tracking-label text-concrete-500">
              {sqft}
            </span>
          )}
        </div>
      )}

      <div className="mt-4 space-y-2.5">
        {site && (
          <DetailRow
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={ICON}>
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
            }
          >
            {site}
          </DetailRow>
        )}

        <DetailRow
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={ICON}>
              <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          }
        >
          <span className="font-semibold text-ink">{t.closing ? fmtClosing(t.closing) : "No due date"}</span>
        </DetailRow>
      </div>

      {t.codes.length > 0 && (
        <div className="mt-4 border-t border-concrete-200 pt-4">
          <TradeCodes codes={t.codes} />
        </div>
      )}

      {/* Bid manager. The empty spacer takes the leftover height so this block
          lines up along the bottom across cards of different heights — the
          margin has to sit on the spacer rather than on the block itself,
          because `mt-auto` collapses to nothing on the tallest card in a row
          and leaves the rule flush against the trade divisions above it. */}
      {(t.contactName || t.contactEmail || t.contactPhone || t.contactFax) && (
        <>
        <div className="mt-auto" aria-hidden />
        <div className="mt-4 border-t border-concrete-200 pt-4">
          <p className="font-mono text-[10px] uppercase tracking-label text-concrete-400">Bid manager</p>
          {t.contactName && <p className="mt-1.5 text-sm font-semibold text-ink">{t.contactName}</p>}
          <div className="mt-1.5 space-y-1 text-sm">
            {t.contactEmail && (
              <p className="truncate">
                <a href={`mailto:${t.contactEmail}`} className="text-brand-700 transition-colors hover:text-brand-800">
                  {t.contactEmail}
                </a>
              </p>
            )}
            {t.contactPhone && (
              <p>
                <a href={telHref(t.contactPhone)} className="font-mono text-xs text-concrete-600 transition-colors hover:text-brand-700">
                  {t.contactPhone}
                </a>
              </p>
            )}
            {t.contactFax && (
              <p className="font-mono text-xs text-concrete-400">Fax {t.contactFax}</p>
            )}
          </div>
        </div>
        </>
      )}

      {t.bidUrl && (
        <a
          href={t.bidUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-md border border-concrete-300 px-4 py-2 font-display text-sm font-semibold text-ink transition-colors hover:border-brand-400 hover:text-brand-700"
        >
          View bid details →
        </a>
      )}
    </div>
  );
}

const STATUSES = ["Active", "Open", "Closing soon", "Closed", "All"] as const;

// Two portfolio groups. "ICI" (Institutional, Commercial & Industrial) is
// everything that isn't residential. The feed's project type is free text, so
// the split is keyword-based — see lib/tender-group.
const GROUPS = ["All", "ICI", "Residential"] as const;

function TenderGroup({ title, items }: { title: string; items: PublicTender[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className="mb-4 flex items-baseline gap-3 font-display text-xl font-bold tracking-tight text-ink">
        {title}
        <span className="font-mono text-[11px] font-normal text-concrete-400">{items.length}</span>
      </h3>
      {/* Two across from `sm`, three only from `xl`: the cards carry the full
          bid detail now, and three of them below that width squeezes the trade
          divisions into unreadable slivers. */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((t) => (
          <TenderCard key={t.id} t={t} />
        ))}
      </div>
    </div>
  );
}

export default function TenderList({ tenders }: { tenders: PublicTender[] }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("Active");
  const [group, setGroup] = useState("All");

  const needle = q.trim().toLowerCase();
  const visible = tenders
    .filter((t) => {
      if (status === "Active") return t.status === "Open" || t.status === "Closing soon";
      if (status === "All") return true;
      return t.status === status;
    })
    .filter((t) => group === "All" || tenderGroupOf(t) === group)
    // Searches the detail the cards show, so a trade can find its own work by
    // division ("concrete", "03300") or by where the site is, not just by title.
    .filter(
      (t) =>
        !needle ||
        [t.title, t.ref, t.org, t.type, t.category, t.city, t.province, t.address, t.contactName, ...t.codes].some(
          (v) => v.toLowerCase().includes(needle)
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
            placeholder="Search by title, trade division, city…"
            className="w-full rounded-md border border-concrete-300 bg-surface py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-label text-accent-700">
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
          <span className="font-mono text-[11px] uppercase tracking-label text-accent-700">
            Category
          </span>
          {GROUPS.map((c) => {
            const on = c === group;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setGroup(c)}
                className={`rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-label transition-colors ${
                  on
                    ? "bg-ink text-paper"
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
        <div className="rounded-xl border border-concrete-200 bg-surface px-8 py-20 text-center">
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
              onClick={() => { setQ(""); setStatus("Active"); setGroup("All"); }}
              className="mt-5 rounded-md border border-concrete-300 px-4 py-2 font-mono text-xs uppercase tracking-label text-accent-700 transition-colors hover:border-brand-400 hover:text-brand-700"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-10">
          <TenderGroup title="ICI Projects" items={visible.filter((t) => tenderGroupOf(t) === "ICI")} />
          <TenderGroup title="Residential Projects" items={visible.filter((t) => tenderGroupOf(t) === "Residential")} />
        </div>
      )}

      <p className="mt-3 font-mono text-[11px] text-concrete-400">
        Showing {visible.length} of {tenders.length} tenders
      </p>
    </div>
  );
}
