"use client";

import Link from "next/link";
import AffiliationLogo from "./AffiliationLogo";
import { nav, company, affiliations } from "@/lib/site";
import { useSiteSettings } from "@/lib/use-settings";
import { telHref } from "@/lib/settings";

// Partners shown in the footer strip (Smartbid lives on the Tenders page only).
const footerPartners = [
  affiliations.find((a) => a.name === "Format Group"),
  affiliations.find((a) => a.name === "OGCA"),
  affiliations.find((a) => a.name === "IHSA · COR"),
  affiliations.find((a) => a.name === "Procore"),
].filter(Boolean) as typeof affiliations;

export default function Footer() {
  const s = useSiteSettings();
  return (
    <footer className="border-t-2 border-accent-500 bg-concrete-200 text-concrete-500">
      <div className="mx-auto grid max-w-8xl gap-x-10 gap-y-8 px-6 py-10 md:grid-cols-12 lg:px-10">
        {/* Brand + tagline */}
        <div className="md:col-span-5">
          <Link href="/" className="inline-flex shrink-0 items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.webp" alt="Pegah Construction Ltd." className="h-11 w-auto" />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-concrete-500">
            General contracting and project management for {company.region} since {company.established}.
          </p>
        </div>

        {/* Sitemap */}
        <nav className="md:col-span-3">
          <h3 className="font-mono text-[11px] font-bold uppercase tracking-label text-accent-700">Sitemap</h3>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-ink transition-colors hover:text-brand-700">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact */}
        <div className="md:col-span-4">
          <h3 className="font-mono text-[11px] font-bold uppercase tracking-label text-accent-700">Contact</h3>
          <address className="mt-3 space-y-0.5 text-sm not-italic leading-relaxed text-ink">
            <div>{s.addressLine1}</div>
            <div>{s.addressLine2}</div>
            <a href={telHref(s.phone)} className="mt-2 block transition-colors hover:text-brand-700">{s.phone}</a>
            <a href={`mailto:${s.email}`} className="block transition-colors hover:text-brand-700">{s.email}</a>
          </address>
        </div>
      </div>

      {/* Slim bottom bar */}
      <div className="border-t border-concrete-300">
        <div className="mx-auto flex max-w-8xl flex-col-reverse items-center gap-4 px-6 py-4 md:flex-row md:justify-between lg:px-10">
          <p className="text-center font-mono text-xs text-concrete-400 md:text-left">
            © {new Date().getFullYear()} {s.companyName} ·{" "}
            <span className="font-semibold text-concrete-600">
              Development projects:{" "}
              <a href="https://www.formatgroup.ca" target="_blank" rel="noopener noreferrer" className="text-brand-700 transition-colors hover:text-brand-800">
                formatgroup.ca
              </a>
            </span>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
            {footerPartners.map((a) => (
              <a
                key={a.name}
                href={a.href}
                target="_blank"
                rel="noopener noreferrer"
                title={a.name}
                className="opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0"
              >
                <AffiliationLogo name={a.name} logo={a.logo} />
              </a>
            ))}
            <a
              href={company.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Pegah Construction on LinkedIn"
              title="Pegah Construction on LinkedIn"
              className="text-concrete-400 transition-colors hover:text-[#0A66C2]"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden="true">
                <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
