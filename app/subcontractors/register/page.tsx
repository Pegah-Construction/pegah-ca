import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import AffiliationLogo from "@/components/AffiliationLogo";
import SmartBidEmbed from "@/components/SmartBidEmbed";
import { Eyebrow } from "@/components/Brand";
import { company, affiliations } from "@/lib/site";

export const metadata: Metadata = {
  title: "Subcontractor Registration",
  alternates: { canonical: "/subcontractors/register" },
  description:
    "Register as a subcontractor with Pegah Construction to receive bid invitations from our estimating team.",
};

export default function SubcontractorRegisterPage() {
  const formUrl = process.env.SMARTBID_SUBCONTRACTOR_FORM_URL;

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-paper">
        {/* Header */}
        <section className="hero-surface border-b border-concrete-200">
          <div className="mx-auto max-w-8xl px-6 py-14 lg:px-10">
            <div className="accent-bar hero-animate mb-5" style={{ animationDelay: "0ms" }} />
            <Eyebrow className="hero-animate" style={{ animationDelay: "60ms" }}>Tenders</Eyebrow>
            <h1 className="hero-animate mt-3 font-display text-4xl font-black tracking-tight text-ink lg:text-5xl" style={{ animationDelay: "120ms" }}>
              Subcontractor Registration
            </h1>
            <div className="hero-animate mt-5 grid max-w-4xl gap-6 text-base leading-relaxed text-concrete-500 sm:grid-cols-2" style={{ animationDelay: "260ms" }}>
              <p>
                Register to be included in our directory of subcontractors. Registration is free and makes your
                company&rsquo;s information available to our Estimating Department.
              </p>
              <p>
                Once registered, you&rsquo;ll receive project invitations from our team as relevant opportunities arise.
                Be sure to select your trade divisions and codes so we can match you to the right work.
              </p>
            </div>

            <div className="hero-animate mt-8 flex flex-wrap items-center gap-x-8 gap-y-4" style={{ animationDelay: "380ms" }}>
              {affiliations
                .filter((a) => a.name !== "Smartbid")
                .map((a) => (
                  <span key={a.name} className="group inline-flex items-center">
                    <AffiliationLogo name={a.name} logo={a.logo} grayscale />
                  </span>
                ))}
            </div>
          </div>
        </section>

        {/* Registration form */}
        <div className="mx-auto max-w-8xl px-6 py-14 lg:px-10">
          {formUrl ? (
            <>
              <Reveal>
                <p className="font-mono text-[11px] uppercase tracking-label text-accent-700">Registration form</p>
                <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink lg:text-3xl">
                  Register your company
                </h2>
                <p className="mt-3 max-w-2xl leading-relaxed text-concrete-500">
                  It takes about five minutes. You choose a username and password as you go, so you can come
                  back and keep your company&rsquo;s details and trade divisions up to date.
                </p>
              </Reveal>

              {/* The form itself, framed so it reads as part of the page */}
              <Reveal delay={80}>
                <div className="mt-8 overflow-hidden rounded-2xl border border-concrete-200 bg-surface shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-concrete-200 bg-concrete-100 px-5 py-3">
                    <p className="font-mono text-[11px] uppercase tracking-label text-concrete-500">
                      Powered by SmartBid
                    </p>
                    <a
                      href={formUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-display text-xs font-semibold text-brand-700 transition-colors hover:text-brand-800"
                    >
                      Open in a new tab ↗
                    </a>
                  </div>
                  <div className="p-3 sm:p-6">
                    <SmartBidEmbed src={formUrl} />
                    <p className="mt-3 text-center text-xs text-concrete-400 sm:hidden">
                      SmartBid&rsquo;s form is a fixed width — swipe sideways inside it, or open it in a new tab
                      for more room.
                    </p>
                  </div>
                </div>
              </Reveal>

              {/* Same treatment as the "Submit a quote" panel on the Tenders page */}
              <Reveal delay={140}>
                <div className="mt-8 rounded-xl border border-brand-200 bg-brand-50 p-8">
                  <p className="font-mono text-[11px] uppercase tracking-label text-accent-700">Need a hand?</p>
                  <h3 className="mt-3 font-display text-xl font-bold text-ink">Rather not use the form?</h3>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-concrete-600">
                    Email our estimating team your company name, contact details and trade divisions and
                    we&rsquo;ll register you ourselves — or call and we&rsquo;ll walk you through it.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a
                      href={`mailto:${company.estimatingEmail}?subject=Subcontractor registration`}
                      className="inline-flex items-center gap-2 rounded-md bg-brand-700 px-5 py-2.5 font-display text-sm font-semibold text-white transition-colors hover:bg-brand-800"
                    >
                      Email {company.estimatingEmail} →
                    </a>
                    <a
                      href={company.phoneHref}
                      className="inline-flex items-center gap-2 rounded-md border border-brand-300 bg-surface px-5 py-2.5 font-mono text-sm text-brand-700 transition-colors hover:border-brand-400"
                    >
                      {company.phone}
                    </a>
                  </div>
                </div>
              </Reveal>
            </>
          ) : (
            <Reveal>
              <div className="mx-auto max-w-xl rounded-xl border border-concrete-200 bg-surface px-8 py-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-brand-700">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                  </svg>
                </div>
                <h2 className="mt-6 font-display text-2xl font-bold tracking-tight text-ink">
                  Registration opening soon
                </h2>
                <p className="mt-3 leading-relaxed text-concrete-500">
                  Our subcontractor registration is managed through our SmartBid portal. To be added to our directory
                  in the meantime, email our estimating team and we&rsquo;ll send you the registration link.
                </p>
                <div className="mt-6 flex flex-col items-center gap-2">
                  <a href={`mailto:${company.estimatingEmail}`} className="inline-flex rounded-md bg-brand-700 px-6 py-3 font-display text-sm font-semibold text-white hover:bg-brand-800">
                    Email {company.estimatingEmail}
                  </a>
                  <a href={company.phoneHref} className="font-mono text-xs text-concrete-500 hover:text-brand-700">
                    or call {company.phone}
                  </a>
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
