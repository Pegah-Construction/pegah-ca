import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import AffiliationLogo from "@/components/AffiliationLogo";
import TenderList, { type PublicTender } from "@/components/TenderList";
import { db } from "@/lib/db";
import { company, affiliations } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tenders | Pegah Construction Ltd.",
  description:
    "Active bid opportunities where Pegah Construction is seeking qualified subcontractor quotes across Ontario.",
};

export default async function TendersPage() {
  const rows = await db.tender.findMany({ orderBy: { closing: "asc" } });

  const tenders: PublicTender[] = rows.map((t) => {
    let codes: string[] = [];
    try { codes = JSON.parse(t.codes || "[]"); } catch { codes = []; }
    return {
      id: t.id, ref: t.ref, title: t.title, org: t.org, type: t.type, category: t.category,
      province: t.province, city: t.city, closing: t.closing, status: t.status,
      address: t.address, postalCode: t.postalCode, bidUrl: t.bidUrl,
      contactName: t.contactName, contactPhone: t.contactPhone, contactFax: t.contactFax,
      codes,
    };
  });

  return (
    <>
      <Navbar />
      <main className="flex-1">

        {/* Hero */}
        <section className="relative flex min-h-[52vh] items-end overflow-hidden">
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 90% 80% at 70% 30%, #1f3a93, #0f1f4d)" }} />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)", backgroundSize: "24px 24px" }} />
          <div className="relative mx-auto w-full max-w-8xl px-6 pb-16 pt-40 lg:px-10">
            <p className="hero-animate font-mono text-[11px] uppercase tracking-label text-brand-300" style={{ animationDelay: "0ms" }}>
              Bid Opportunities
            </p>
            <h1 className="hero-animate mt-3 font-display text-5xl font-black tracking-tight text-white lg:text-7xl" style={{ animationDelay: "120ms" }}>
              Tenders
            </h1>
            <p className="hero-animate mt-5 max-w-xl text-lg leading-relaxed text-brand-100/80" style={{ animationDelay: "260ms" }}>
              We are currently seeking qualified subcontractor and supplier quotes on the following active bids across Ontario.
            </p>
          </div>
        </section>

        {/* Intro */}
        <section className="border-b border-concrete-200 bg-white">
          <div className="mx-auto max-w-8xl px-6 py-14 lg:px-10">
            <div className="grid max-w-5xl gap-8 lg:grid-cols-2">
              <Reveal direction="left">
                <p className="text-lg leading-relaxed text-concrete-600">
                  Pegah Construction&rsquo;s experience as a general contractor continually submitting bids in the open market enables us to remain up to date on the latest industry trends and pricing. Our estimating team works closely with trusted trade partners to deliver competitive, high-quality results for every project.
                </p>
              </Reveal>
              <Reveal direction="right" delay={100}>
                <p className="text-lg leading-relaxed text-concrete-600">
                  Subcontractors and suppliers who wish to be considered for future invitations are encouraged to register in our directory. All registered trades receive bid packages directly from our estimating office as relevant opportunities arise.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Active Bids */}
        <section className="mx-auto max-w-8xl px-6 py-20 lg:px-10">
          <Reveal>
            <div className="mb-10 flex items-end justify-between">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-label text-concrete-500">Current opportunities</p>
                <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-ink lg:text-4xl">Active Bids</h2>
              </div>
              <a href="/subcontractors/register" className="hidden shrink-0 rounded-md bg-brand-700 px-5 py-2.5 font-display text-sm font-semibold text-white transition-colors hover:bg-brand-800 sm:inline-flex">
                Register as trade partner →
              </a>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <a
              href="https://smartbid.co/"
              target="_blank"
              rel="noopener noreferrer"
              title="SmartBid by ConstructConnect"
              className="mx-auto mb-8 block w-fit transition-opacity hover:opacity-80"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/smartbid.png" alt="SmartBid by ConstructConnect" className="h-14 w-auto object-contain" />
            </a>
          </Reveal>
          <Reveal delay={150}>
            <TenderList tenders={tenders} />
          </Reveal>
        </section>

        {/* Estimating Contact */}
        <section className="border-t border-concrete-200 bg-white">
          <div className="mx-auto max-w-8xl px-6 py-20 lg:px-10">
            <Reveal>
              <div className="mb-10">
                <p className="font-mono text-[11px] uppercase tracking-label text-concrete-500">Get in touch</p>
                <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-ink lg:text-4xl">Estimating Team</h2>
              </div>
            </Reveal>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Reveal direction="up" delay={80} className="h-full">
                <div className="h-full rounded-xl border border-concrete-200 bg-paper p-8">
                  <p className="font-mono text-[11px] uppercase tracking-label text-brand-600">Head Office, Toronto</p>
                  <h3 className="mt-3 font-display text-xl font-bold text-ink">Pegah Construction Ltd.</h3>
                  <address className="mt-4 space-y-3 not-italic">
                    <p className="text-sm leading-relaxed text-concrete-500">{company.address.line1}<br />{company.address.line2}</p>
                    <div className="space-y-1.5 pt-1">
                      <p className="flex items-center gap-2 font-mono text-xs text-ink">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0 text-brand-600">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.52 2 2 0 0 1 3.6 1.37h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.5 16.5z" />
                        </svg>
                        <a href={company.phoneHref} className="transition-colors hover:text-brand-700">{company.phone}</a>
                      </p>
                      <p className="flex items-center gap-2 font-mono text-xs text-ink">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0 text-brand-600">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><path d="m22 6-10 7L2 6" />
                        </svg>
                        <a href={`mailto:${company.estimatingEmail}`} className="transition-colors hover:text-brand-700">{company.estimatingEmail}</a>
                      </p>
                    </div>
                  </address>
                </div>
              </Reveal>
              <Reveal direction="up" delay={160} className="sm:col-span-2 lg:col-span-2">
                <div className="h-full rounded-xl border border-brand-200 bg-brand-50 p-8">
                  <p className="font-mono text-[11px] uppercase tracking-label text-brand-600">Submit a quote</p>
                  <h3 className="mt-3 font-display text-xl font-bold text-ink">Ready to bid on a project?</h3>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-concrete-600">
                    Contact our estimating team to receive bid packages, RFQ documentation, and site visit information for any active tender listed above. Please have your company name and trade division ready when you call.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a href={`mailto:${company.estimatingEmail}`} className="inline-flex items-center gap-2 rounded-md bg-brand-700 px-5 py-2.5 font-display text-sm font-semibold text-white transition-colors hover:bg-brand-800">
                      Email our estimating team →
                    </a>
                    <a href={company.phoneHref} className="inline-flex items-center gap-2 rounded-md border border-brand-300 bg-white px-5 py-2.5 font-mono text-sm text-brand-700 transition-colors hover:border-brand-400">
                      {company.phone}
                    </a>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Memberships & affiliations */}
        <section className="border-t border-concrete-200 bg-paper">
          <div className="mx-auto max-w-8xl px-6 py-16 lg:px-10">
            <Reveal>
              <p className="text-center font-mono text-[11px] uppercase tracking-label text-concrete-500">Memberships &amp; Affiliations</p>
              <h2 className="mt-2 text-center font-display text-2xl font-bold tracking-tight text-ink lg:text-3xl">
                Trusted partners &amp; certifications
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
                {affiliations.map((a) => (
                  <a
                    key={a.name}
                    href={a.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={a.name}
                    className="group inline-flex items-center"
                  >
                    <AffiliationLogo name={a.name} logo={a.logo} grayscale />
                  </a>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* Subcontractor registration CTA */}
        <section className="bg-brand-900">
          <div className="mx-auto max-w-8xl px-6 py-20 lg:px-10">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <Reveal direction="left">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-label text-brand-300">Subcontractors &amp; Suppliers</p>
                  <h2 className="mt-3 font-display text-4xl font-black tracking-tight text-white lg:text-5xl">Become a<br />Trade Partner</h2>
                  <p className="mt-5 max-w-lg text-lg leading-relaxed text-brand-100/80">
                    Register in our subcontractor directory and receive project invitations directly from our estimating team. Registration is free and takes less than five minutes.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-4">
                    <a href="/subcontractors/register" className="inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 font-display text-sm font-semibold text-brand-900 transition-colors hover:bg-brand-50">Register now →</a>
                    <a href={`mailto:${company.estimatingEmail}`} className="inline-flex items-center gap-2 rounded-md border border-white/20 px-6 py-3 font-display text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/5">Contact us</a>
                  </div>
                </div>
              </Reveal>
              <Reveal direction="right" delay={100}>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { title: "Free registration", desc: "No fee to join our trade partner directory." },
                    { title: "Direct invitations", desc: "Receive bid packages as relevant projects arise." },
                    { title: "23 trade divisions", desc: "Select exactly which CSI MasterFormat divisions you cover." },
                    { title: "Ontario focus", desc: "Projects across the GTA and surrounding region." },
                  ].map((item) => (
                    <div key={item.title} className="rounded-lg border border-white/10 bg-white/5 p-5">
                      <p className="font-display text-sm font-bold text-white">{item.title}</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-brand-200/70">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
