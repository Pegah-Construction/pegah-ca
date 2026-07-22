"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav, company } from "@/lib/site";
import { SiteLogo } from "./Brand";
import { useAuth } from "@/lib/auth";

const PALETTE = ["bg-brand-700", "bg-brand-500", "bg-brand-800", "bg-concrete-500", "bg-brand-600"];

function UserAvatar({ name, id }: { name: string; id: string }) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const color = PALETTE[Math.abs(id.charCodeAt(1)) % PALETTE.length];
  return (
    <span className={`${color} inline-flex h-8 w-8 items-center justify-center rounded-full font-display text-xs font-bold text-white`}>
      {initials}
    </span>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu whenever the route changes.
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-concrete-200 bg-paper/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-8xl items-center gap-8 px-6 py-4 lg:px-10">
        <SiteLogo />

        <ul className="ml-4 hidden items-center gap-7 lg:flex">
          {nav.map((item) => {
            const onSection = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
            const isActive =
              onSection(item.href) ||
              item.children?.some((c) => onSection(c.href));

            if (item.children) {
              return (
                <li key={item.href} className="group relative">
                  <Link
                    href={item.href}
                    className={`flex items-center gap-1 font-display text-sm font-semibold transition-colors ${
                      isActive ? "text-ink underline underline-offset-8 decoration-2 decoration-brand-500" : "text-ink hover:text-brand-700"
                    }`}
                  >
                    {item.label}
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3.5 w-3.5 transition-transform duration-150 group-hover:rotate-180"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </Link>

                  {/* Dropdown panel — pt-3 bridges the gap so hover doesn't break */}
                  <div className="invisible absolute left-0 top-full z-50 pt-3 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100">
                    <div className="min-w-[220px] overflow-hidden rounded-xl border border-concrete-200 bg-white shadow-xl shadow-ink/5">
                      {item.children.map((child) => {
                        const childActive = pathname === child.href;
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`flex items-center gap-3 px-5 py-3.5 text-sm font-semibold transition-colors first:pt-4 last:pb-4 ${
                              childActive
                                ? "bg-brand-50 text-brand-700"
                                : "text-ink hover:bg-brand-50/60 hover:text-brand-700"
                            }`}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </li>
              );
            }

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`font-display text-sm font-semibold transition-colors ${
                    isActive ? "text-ink underline underline-offset-8 decoration-2 decoration-brand-500" : "text-ink hover:text-brand-700"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="ml-auto flex items-center gap-4 sm:gap-5">
          <a
            href={company.phoneHref}
            className="hidden items-center gap-2 font-display text-sm font-semibold text-ink transition-colors hover:text-brand-700 lg:inline-flex"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.24.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
            </svg>
            TEL: {company.phone}
          </a>
          <a
            href={`mailto:${company.estimatingEmail}`}
            className="hidden whitespace-nowrap rounded-md bg-ink px-4 py-2 font-display text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-ink/90 sm:inline-flex"
          >
            Email Estimating
          </a>
          {user && (
            <Link href="/admin" title="Go to dashboard">
              <UserAvatar name={user.name} id={user.id} />
            </Link>
          )}
          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="-mr-1 inline-flex items-center justify-center rounded-md p-2 text-ink hover:bg-concrete-100 lg:hidden"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              {menuOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <><path d="M3 12h18" /><path d="M3 6h18" /><path d="M3 18h18" /></>}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div className="border-t border-concrete-200 bg-paper lg:hidden">
          <ul className="mx-auto max-w-8xl space-y-1 px-6 py-4">
            {nav.map((item) => {
              const isActive = pathname === item.href || item.children?.some((c) => pathname === c.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block rounded-md px-3 py-2.5 font-display text-base font-medium transition-colors ${
                      isActive ? "bg-brand-50 text-brand-700" : "text-ink/80 hover:bg-concrete-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <ul className="ml-3 border-l border-concrete-200 pl-3">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                              pathname === child.href ? "text-brand-700" : "text-ink/60 hover:text-brand-700"
                            }`}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}

            <li className="!mt-3 flex flex-col gap-3 border-t border-concrete-200 pt-4">
              <a
                href={`mailto:${company.estimatingEmail}`}
                className="rounded-md bg-ink px-4 py-2 text-center font-display text-sm font-bold uppercase tracking-wide text-white hover:bg-ink/90"
              >
                Email Estimating
              </a>
              <a href={company.phoneHref} className="flex items-center justify-center gap-2 font-display text-sm font-semibold text-ink">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.24.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                </svg>
                TEL: {company.phone}
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
