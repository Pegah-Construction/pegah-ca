"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { PERMS, ROLES, type NavKey } from "@/lib/admin";
import { Avatar, RolePill } from "./ui";

const NAV: { key: NavKey; label: string; href: string }[] = [
  { key: "dashboard", label: "Dashboard", href: "/admin" },
  { key: "projects", label: "Projects", href: "/admin/projects" },
  // { key: "board", label: "Task Board", href: "/admin/board" },
  // { key: "schedule", label: "Schedule", href: "/admin/schedule" },
  { key: "tenders", label: "Tenders", href: "/admin/tenders" },
  { key: "news", label: "News & Blog", href: "/admin/news" },
  // { key: "clients", label: "Clients", href: "/admin/clients" },
  { key: "users", label: "Users & Roles", href: "/admin/users" },
  { key: "safety", label: "Safety", href: "/admin/safety" },
  // { key: "documents", label: "Documents", href: "/admin/documents" },
  { key: "ai", label: "AI Assistant", href: "/admin/ai" },
  { key: "settings", label: "Settings", href: "/admin/settings" },
];

const ICONS: Record<string, React.ReactNode> = {
  dashboard: <><path d="M3 3h7v7H3z" /><path d="M14 3h7v7h-7z" /><path d="M14 14h7v7h-7z" /><path d="M3 14h7v7H3z" /></>,
  projects: <><path d="M3 21h18" /><path d="M5 21V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v16" /><path d="M14 9h4a1 1 0 0 1 1 1v11" /><path d="M8 8h2M8 12h2M8 16h2" /></>,
  tasks: <><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>,
  schedule: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
  clients: <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></>,
  users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
  safety: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  documents: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>,
  board: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18M15 3v18" /></>,
  tenders: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M9 13h6M9 17h6" /></>,
  news: <><path d="M4 4h16v16H4z" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
  ai: <><path d="M12 2a3 3 0 0 1 3 3v1a3 3 0 0 1 3 3 3 3 0 0 1 0 6 3 3 0 0 1-3 3v1a3 3 0 0 1-6 0v-1a3 3 0 0 1-3-3 3 3 0 0 1 0-6 3 3 0 0 1 3-3V5a3 3 0 0 1 3-3z" /><circle cx="9" cy="11" r="1" /><circle cx="15" cy="11" r="1" /></>,
};

function Icon({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {ICONS[name]}
    </svg>
  );
}

export default function AdminShell({
  active,
  title,
  sub,
  children,
}: {
  active: NavKey;
  title: string;
  sub?: string;
  children: React.ReactNode;
}) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  if (!user) return null;
  const perms = PERMS[user.role];
  const items = NAV.filter((n) => perms.nav.includes(n.key));

  return (
    <div className="min-h-screen bg-paper">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-brand-900">
        <div className="flex items-center gap-2 px-6 py-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-[7px] bg-white font-display text-lg font-black text-brand-800">P</span>
          <span className="font-display text-base font-extrabold tracking-tight text-white">PEGAH<span className="text-brand-300"> Admin</span></span>
        </div>
        <nav className="mt-2 flex-1 space-y-1 px-3">
          {items.map((n) => {
            const on = n.key === active || (n.href !== "/admin" && pathname.startsWith(n.href));
            return (
              <Link key={n.key} href={n.href}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  on ? "bg-white/10 text-white" : "text-brand-100/70 hover:bg-white/5 hover:text-white"
                }`}>
                <span className={on ? "text-white" : "text-brand-200/70 group-hover:text-white"}><Icon name={n.key} /></span>
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <Avatar name={user.name} id={user.id} />
            <div className="min-w-0">
              <div className="truncate font-display text-sm font-semibold text-white">{user.name}</div>
              <div className="truncate font-mono text-[11px] text-brand-200/70">{ROLES[user.role].label}</div>
            </div>
          </div>
          <button onClick={signOut} className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-brand-100/70 transition-colors hover:bg-white/5 hover:text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-concrete-200 bg-paper/85 px-8 py-4 backdrop-blur-md">
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-ink">{title}</h1>
            {sub ? <p className="font-mono text-xs text-concrete-500">{sub}</p> : null}
          </div>
          <div className="ml-auto flex items-center gap-4">
            <RolePill role={user.role} />
          </div>
        </header>
        <main className="px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
