"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { PERMS, ROLES, type NavKey } from "@/lib/admin";
import { Avatar, RolePill } from "./ui";
import { LogoMark } from "@/components/Brand";
import ChangePasswordModal from "./ChangePasswordModal";

const NAV: { key: NavKey; label: string; href: string }[] = [
  { key: "dashboard", label: "Dashboard", href: "/admin" },
  { key: "projects", label: "Projects", href: "/admin/projects" },
  // { key: "board", label: "Task Board", href: "/admin/board" },
  // { key: "schedule", label: "Schedule", href: "/admin/schedule" },
  { key: "tenders", label: "Tenders", href: "/admin/tenders" },
  { key: "news", label: "News & Blog", href: "/admin/news" },
  { key: "careers", label: "Careers", href: "/admin/careers" },
  { key: "inquiries", label: "Inquiries", href: "/admin/inquiries" },
  { key: "team", label: "About / Team", href: "/admin/team" },
  // { key: "clients", label: "Clients", href: "/admin/clients" },
  { key: "users", label: "Users & Roles", href: "/admin/users" },
  // { key: "safety", label: "Safety", href: "/admin/safety" },
  // { key: "documents", label: "Documents", href: "/admin/documents" },
  // { key: "ai", label: "AI Assistant", href: "/admin/ai" },
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
  careers: <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /><path d="M12 12v4m-2-2h4" /></>,
  subcontractors: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /><path d="M12 17l2 2 4-4" /></>,
  inquiries: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></>,
  team: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /><path d="M12 17l2 2 4-4" /></>,
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
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  // Close the mobile sidebar whenever the route changes.
  useEffect(() => { setNavOpen(false); }, [pathname]);

  if (!user) return null;
  const perms = PERMS[user.role];
  const items = NAV.filter((n) => perms.nav.includes(n.key));

  return (
    <div className="min-h-screen bg-paper">
      {/* Mobile backdrop */}
      {navOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-brand-900 transition-transform duration-200 lg:translate-x-0 ${
          navOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center px-4 py-5">
          <LogoMark href="/admin" heightClass="h-12" />
        </div>
        <nav className="mt-2 min-h-0 flex-1 space-y-1 overflow-y-auto px-3">
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
          <div className="my-2 border-t border-white/10" />
          <Link href="/" target="_blank"
            className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-brand-100/70 transition-colors hover:bg-white/5 hover:text-white">
            <span className="text-brand-200/70 group-hover:text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><path d="M15 3h6v6" /><path d="M10 14L21 3" />
              </svg>
            </span>
            View website
          </Link>
        </nav>
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <Avatar name={user.name} id={user.id} />
            <div className="min-w-0">
              <div className="truncate font-display text-sm font-semibold text-white">{user.name}</div>
              <div className="truncate font-mono text-[11px] text-brand-200/70">{ROLES[user.role].label}</div>
            </div>
          </div>
          <button onClick={() => setShowChangePassword(true)} className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-brand-100/70 transition-colors hover:bg-white/5 hover:text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            Change password
          </button>
          <button onClick={signOut} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-brand-100/70 transition-colors hover:bg-white/5 hover:text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>
            Sign out
          </button>
        </div>
      </aside>

      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-concrete-200 bg-paper/85 px-4 py-4 backdrop-blur-md sm:gap-4 sm:px-8">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            aria-label="Open menu"
            className="-ml-1 inline-flex items-center justify-center rounded-md p-2 text-ink hover:bg-concrete-100 lg:hidden"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <path d="M3 12h18" /><path d="M3 6h18" /><path d="M3 18h18" />
            </svg>
          </button>
          <div className="min-w-0">
            <h1 className="truncate font-display text-lg font-bold tracking-tight text-ink sm:text-xl">{title}</h1>
            {sub ? <p className="truncate font-mono text-xs text-concrete-500">{sub}</p> : null}
          </div>
          <div className="ml-auto flex items-center gap-4">
            <RolePill role={user.role} />
          </div>
        </header>
        <main key={pathname} className="admin-enter px-4 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
