import Link from "next/link";
import { Wordmark } from "./Brand";
import { nav, company } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="bg-ink text-concrete-200">
      <div className="mx-auto grid max-w-8xl gap-12 px-6 py-16 lg:grid-cols-12 lg:px-10">
        <div className="lg:col-span-5">
          <Wordmark light />
          <p className="mt-5 max-w-xs leading-relaxed text-concrete-300">
            General contracting and project management for {company.region}{" "}
            since {company.established}.
          </p>
        </div>

        <div className="lg:col-span-3">
          <h3 className="font-mono text-[11px] uppercase tracking-label text-concrete-400">
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
          <h3 className="font-mono text-[11px] uppercase tracking-label text-concrete-400">
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
        <div className="mx-auto flex max-w-8xl items-center justify-between gap-4 px-6 py-6 lg:px-10">
          <p className="font-mono text-xs text-concrete-400">
            © {new Date().getFullYear()} {company.name}
          </p>
          <Link
            href="/admin"
            className="font-mono text-xs text-concrete-400 transition-colors hover:text-white"
          >
            Staff login →
          </Link>
        </div>
      </div>
    </footer>
  );
}
