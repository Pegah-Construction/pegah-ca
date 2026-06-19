"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
                      isActive ? "text-brand-700" : "text-ink/70 hover:text-brand-700"
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
                    isActive ? "text-brand-700" : "text-ink/70 hover:text-brand-700"
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
          {ready && !user && (
            <Link
              href="/admin"
              className="whitespace-nowrap rounded-md border border-concrete-200 px-4 py-2 font-display text-sm font-semibold text-ink transition-colors hover:bg-concrete-50"
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
            className="whitespace-nowrap rounded-md bg-brand-700 px-4 py-2 font-display text-sm font-semibold text-white transition-colors hover:bg-brand-800"
          >
            Start a project
          </Link>
        </div>
      </nav>
    </header>
  );
}
