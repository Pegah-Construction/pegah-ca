import Link from "next/link";
import { LogoMark } from "./Brand";
import AffiliationLogo from "./AffiliationLogo";
import { nav, company, affiliations } from "@/lib/site";

// Partners shown in the footer strip (Smartbid lives on the Tenders page only).
const footerPartners = [
  affiliations.find((a) => a.name === "Format Group"),
  affiliations.find((a) => a.name === "OGCA"),
  affiliations.find((a) => a.name === "IHSA · COR"),
  affiliations.find((a) => a.name === "Procore"),
].filter(Boolean) as typeof affiliations;

export default function Footer() {
  return (
    <footer className="bg-ink text-concrete-200">
      <div className="mx-auto grid max-w-8xl gap-12 px-6 py-16 lg:grid-cols-12 lg:px-10">
        <div className="lg:col-span-5">
          <LogoMark href="/" heightClass="h-16" />
          <p className="mt-5 max-w-xs leading-relaxed text-concrete-300">
            General contracting and project management for {company.region}{" "}
            since {company.established}.
          </p>
        </div>

        <div className="lg:col-span-3">
          <h3 className="font-mono text-[11px] uppercase tracking-label text-concrete-300">
            Sitemap
          </h3>
          <ul className="mt-4 space-y-2">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-concrete-200 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-4">
          <h3 className="font-mono text-[11px] uppercase tracking-label text-concrete-300">
            Contact
          </h3>
          <address className="mt-4 space-y-1 not-italic leading-relaxed text-concrete-200">
            <div>{company.address.line1}</div>
            <div>{company.address.line2}</div>
            <a
              href={company.phoneHref}
              className="mt-3 block transition-colors hover:text-white"
            >
              {company.phone}
            </a>
            <a
              href={`mailto:${company.email}`}
              className="block transition-colors hover:text-white"
            >
              {company.email}
            </a>
          </address>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-8xl flex-wrap items-center justify-center gap-x-6 gap-y-5 px-6 py-8 lg:px-10">
          {footerPartners.map((a) => (
            <a
              key={a.name}
              href={a.href}
              target="_blank"
              rel="noopener noreferrer"
              title={a.name}
              className="group inline-flex items-center rounded-md bg-white px-4 py-2.5 transition-transform hover:-translate-y-0.5"
            >
              <AffiliationLogo name={a.name} logo={a.logo} />
            </a>
          ))}
          <a
            href={company.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            title="Pegah Construction on LinkedIn"
            aria-label="Pegah Construction on LinkedIn"
            className="group inline-flex items-center rounded-md bg-white px-4 py-2.5 transition-transform hover:-translate-y-0.5"
          >
            <svg viewBox="0 0 24 24" fill="#0A66C2" className="h-7 w-7" aria-hidden="true">
              <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
            </svg>
          </a>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-8xl flex-wrap items-center justify-between gap-4 px-6 py-6 lg:px-10">
          <p className="font-mono text-xs text-concrete-300">
            © {new Date().getFullYear()} {company.name}
          </p>
          <p className="font-mono text-xs text-concrete-300">
            For our development projects visit{" "}
            <a
              href="https://www.formatgroup.ca"
              target="_blank"
              rel="noopener noreferrer"
              className="text-concrete-200 transition-colors hover:text-white"
            >
              www.formatgroup.ca
            </a>
          </p>
          <Link
            href="/admin"
            className="font-mono text-xs text-concrete-300 transition-colors hover:text-white"
          >
            Staff login →
          </Link>
        </div>
      </div>
    </footer>
  );
}
