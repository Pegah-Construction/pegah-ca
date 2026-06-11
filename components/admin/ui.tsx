import Link from "next/link";
import { ROLES, type RoleKey } from "@/lib/admin";

type Tone = "green" | "blue" | "amber" | "red" | "gray";

const TONE: Record<Tone, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  blue: "bg-brand-50 text-brand-700 ring-brand-600/20",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
  red: "bg-red-50 text-red-700 ring-red-600/20",
  gray: "bg-concrete-100 text-concrete-500 ring-concrete-400/30",
};

export function Pill({ text, tone = "gray" }: { text: string; tone?: Tone }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${TONE[tone]}`}>
      {text}
    </span>
  );
}

const STATUS_TONE: Record<string, Tone> = {
  "In Progress": "blue", Planning: "amber", "On Hold": "red", Complete: "green",
  Open: "red", "Under review": "amber", Closed: "green",
  "To Do": "gray", Blocked: "red", Done: "green",
};
export const StatusPill = ({ status }: { status: string }) => (
  <Pill text={status} tone={STATUS_TONE[status] ?? "gray"} />
);
export const RolePill = ({ role }: { role: RoleKey }) => (
  <Pill text={ROLES[role].label} tone={role === "admin" ? "blue" : role === "pm" ? "amber" : "gray"} />
);
export const PriorityPill = ({ p }: { p: string }) => (
  <Pill text={p} tone={p === "High" ? "red" : p === "Medium" ? "amber" : "gray"} />
);

export function Bar({ pct }: { pct: number }) {
  const tone = pct >= 100 ? "bg-emerald-500" : pct >= 50 ? "bg-brand-600" : "bg-brand-400";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-concrete-200">
        <div className={`h-full ${tone}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-xs text-concrete-500">{pct}%</span>
    </div>
  );
}

const PALETTE = ["bg-brand-700", "bg-brand-500", "bg-brand-800", "bg-concrete-500", "bg-brand-600"];
export function Avatar({ name, id, size = "h-9 w-9 text-xs" }: { name: string; id: string; size?: string }) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const color = PALETTE[Math.abs(id.charCodeAt(1)) % PALETTE.length];
  return (
    <span className={`${size} ${color} inline-flex items-center justify-center rounded-full font-display font-bold text-white`}>
      {initials}
    </span>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-concrete-200 bg-white p-5">
      <div className="font-mono text-[11px] uppercase tracking-label text-concrete-500">{label}</div>
      <div className="mt-2 font-display text-3xl font-black tracking-tight text-ink">{value}</div>
      {hint ? <div className="mt-1 text-sm text-concrete-500">{hint}</div> : null}
    </div>
  );
}

export function Card({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-concrete-200 bg-white">
      <div className="flex items-center justify-between border-b border-concrete-200 px-5 py-4">
        <h2 className="font-display text-sm font-bold tracking-tight text-ink">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

export function THead({ cols }: { cols: string[] }) {
  return (
    <thead>
      <tr className="border-b border-concrete-200 text-left">
        {cols.map((c, i) => (
          <th key={i} className="px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-wide text-concrete-500">{c}</th>
        ))}
      </tr>
    </thead>
  );
}

export const Table = ({ children }: { children: React.ReactNode }) => (
  <div className="overflow-x-auto"><table className="w-full border-collapse text-sm">{children}</table></div>
);

export function AccessDenied({ msg }: { msg?: string }) {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-concrete-200 bg-white p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
      </div>
      <h2 className="mt-4 font-display text-xl font-bold text-ink">Access restricted</h2>
      <p className="mt-2 text-sm text-concrete-500">{msg ?? "Your role doesn’t have permission to view this section."}</p>
      <Link href="/admin" className="mt-5 inline-flex rounded-md bg-brand-700 px-4 py-2 font-display text-sm font-semibold text-white hover:bg-brand-800">
        Back to dashboard
      </Link>
    </div>
  );
}

export const PrimaryBtn = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
  <button onClick={onClick} className="rounded-md bg-brand-700 px-3 py-1.5 font-display text-xs font-semibold text-white hover:bg-brand-800">{children}</button>
);

export function SearchInput({ value, onChange, placeholder = "Search…" }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-concrete-400">
        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4-4" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-concrete-200 bg-white py-1.5 pl-8 pr-3 text-sm text-ink placeholder:text-concrete-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 sm:w-56"
      />
    </div>
  );
}

export const inputCls = "w-full rounded-md border border-concrete-200 bg-white px-3 py-2 text-sm text-ink placeholder:text-concrete-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-wide text-concrete-500">{label}</span>
      {children}
    </label>
  );
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-concrete-200 px-6 py-4">
          <h2 className="font-display text-sm font-bold text-ink">{title}</h2>
          <button onClick={onClose} className="rounded-md p-1 text-concrete-400 hover:bg-concrete-100 hover:text-ink">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
