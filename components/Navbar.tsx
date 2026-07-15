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
  const { user, ready } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu whenever the route changes.
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-concrete-200 bg-paper/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-8xl items-center gap-8 px-6 py-4 lg:px-10">
        <SiteLogo />

        <ul className="ml-4 hidden items-center gap-7 lg:flex">
          {nav.map((item) => {
            const isActive =
              pathname === item.href ||
              item.children?.some((c) => pathname === c.href);

            if (item.children) {
              return (
                <li key={item.href} className="group relative">
                  <Link
                    href={item.href}
                    className={`flex items-center gap-1 font-display text-sm font-medium transition-colors ${
                      isActive ? "text-ink underline underline-offset-8 decoration-2" : "text-ink/70 hover:text-ink"
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
                            className={`flex items-center gap-3 px-5 py-3.5 text-sm transition-colors first:pt-4 last:pb-4 ${
                              childActive
                                ? "bg-brand-50 font-semibold text-brand-700"
                                : "text-ink/70 hover:bg-brand-50/60 hover:text-brand-700"
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
                  className={`font-display text-sm font-medium transition-colors ${
                    isActive ? "text-ink underline underline-offset-8 decoration-2" : "text-ink/70 hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="ml-auto flex items-center gap-3 sm:gap-5">
          <a
            href={company.phoneHref}
            className="hidden font-mono text-xs tracking-wide text-concrete-500 lg:inline"
          >
            {company.phone}
          </a>
          {ready && !user && (
            <Link
              href="/admin"
              className="hidden whitespace-nowrap rounded-md border border-concrete-200 px-4 py-2 font-display text-sm font-semibold text-ink transition-colors hover:bg-concrete-50 sm:inline-flex"
            >
              Login
            </Link>
          )}
          {user && (
            <Link href="/admin" title="Go to dashboard">
              <UserAvatar name={user.name} id={user.id} />
            </Link>
          )}
          <Link
            href="/contact"
            className="hidden whitespace-nowrap rounded-md bg-brand-700 px-4 py-2 font-display text-sm font-semibold text-white transition-colors hover:bg-brand-800 sm:inline-flex"
          >
            Start a project
          </Link>

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

            <li className="!mt-3 flex flex-wrap items-center gap-3 border-t border-concrete-200 pt-4">
              {ready && !user && (
                <Link href="/admin" className="rounded-md border border-concrete-200 px-4 py-2 font-display text-sm font-semibold text-ink hover:bg-concrete-50">
                  Login
                </Link>
              )}
              <Link href="/contact" className="rounded-md bg-brand-700 px-4 py-2 font-display text-sm font-semibold text-white hover:bg-brand-800">
                Start a project
              </Link>
              <a href={company.phoneHref} className="ml-auto font-mono text-xs tracking-wide text-concrete-500">
                {company.phone}
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
