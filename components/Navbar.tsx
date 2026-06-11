"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav, company } from "@/lib/site";
import { SiteLogo } from "./Brand";

/**
 * Solid, always-legible navbar. Sticks to the top on every page so the
 * wordmark and links are readable regardless of the section behind them
 * or the visitor's light/dark browser preference.
 */
export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-concrete-200 bg-paper/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-8xl items-center gap-8 px-6 py-4 lg:px-10">
        <SiteLogo />

        <ul className="ml-4 hidden items-center gap-7 lg:flex">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`font-display text-sm font-medium transition-colors ${
                    active
                      ? "text-brand-700"
                      : "text-ink/70 hover:text-brand-700"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="ml-auto flex items-center gap-5">
          <a
            href={company.phoneHref}
            className="hidden font-mono text-xs tracking-wide text-concrete-500 sm:inline"
          >
            {company.phone}
          </a>
          <Link
            href="/contact"
            className="whitespace-nowrap rounded-md bg-brand-700 px-4 py-2 font-display text-sm font-semibold text-white transition-colors hover:bg-brand-800"
          >
            Start a project
          </Link>
        </div>
      </nav>
    </header>
  );
}
