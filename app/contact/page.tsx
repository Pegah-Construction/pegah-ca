import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { company } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact — Pegah Construction Ltd.",
};

export default function ContactPage() {
  return (
    <PageShell
      eyebrow="Get in touch"
      title="Let's build something."
      intro="Tell us about your project and our team will get back to you."
    >
      <div className="grid gap-12 lg:grid-cols-2">
        <form className="space-y-5">
          {["Name", "Email", "Company"].map((label) => (
            <div key={label}>
              <label className="font-mono text-xs uppercase tracking-label text-concrete-500">
                {label}
              </label>
              <input
                type="text"
                className="mt-2 w-full rounded-md border border-concrete-300 bg-white px-4 py-3 outline-none focus:border-brand-500"
              />
            </div>
          ))}
          <div>
            <label className="font-mono text-xs uppercase tracking-label text-concrete-500">
              Project details
            </label>
            <textarea
              rows={4}
              className="mt-2 w-full rounded-md border border-concrete-300 bg-white px-4 py-3 outline-none focus:border-brand-500"
            />
          </div>
          <button
            type="button"
            className="rounded-md bg-brand-700 px-6 py-3 font-display text-sm font-semibold text-white transition-colors hover:bg-brand-800"
          >
            Send enquiry →
          </button>
        </form>

        <div className="space-y-6">
          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-label text-concrete-500">
              Office
            </h3>
            <p className="mt-2 leading-relaxed text-ink">
              {company.address.line1}
              <br />
              {company.address.line2}
            </p>
          </div>
          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-label text-concrete-500">
              Phone
            </h3>
            <a
              href={company.phoneHref}
              className="mt-2 block text-ink hover:text-brand-700"
            >
              {company.phone}
            </a>
          </div>
          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-label text-concrete-500">
              Email
            </h3>
            <a
              href={`mailto:${company.email}`}
              className="mt-2 block text-ink hover:text-brand-700"
            >
              {company.email}
            </a>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
