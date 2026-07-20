import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { db } from "@/lib/db";
import { company } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Careers | Pegah Construction Ltd.",
  description:
    "Join Pegah Construction's team of builders and project professionals. View open positions across construction, project management, estimating, and more.",
};

const TYPE_STYLE: Record<string, string> = {
  "Full-time": "bg-brand-50 text-brand-700",
  "Part-time": "bg-concrete-100 text-concrete-600",
  "Contract": "bg-amber-50 text-amber-700",
  "Seasonal": "bg-emerald-50 text-emerald-700",
};

export default async function CareersPage() {
  const jobs = await db.jobPosting.findMany({
    where: { status: "Published" },
    orderBy: { createdAt: "desc" },
  });

  const byDept = jobs.reduce<Record<string, typeof jobs>>((acc, j) => {
    const key = j.department || "General";
    acc[key] = acc[key] ? [...acc[key], j] : [j];
    return acc;
  }, {});

  const depts = Object.keys(byDept).sort();

  return (
    <>
      <Navbar />
      <main className="flex-1">

        {/* Hero */}
        <section className="relative flex min-h-[44vh] items-end overflow-hidden">
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 90% 80% at 30% 40%, #1f3a93, #0f1f4d)" }}
          />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="relative mx-auto w-full max-w-8xl px-6 pb-16 pt-36 lg:px-10">
            <p className="hero-animate font-mono text-[11px] uppercase tracking-label text-brand-300" style={{ animationDelay: "0ms" }}>
              Join our team
            </p>
            <h1 className="hero-animate mt-3 font-display text-5xl font-black tracking-tight text-white lg:text-7xl" style={{ animationDelay: "120ms" }}>
              Careers
            </h1>
            <p className="hero-animate mt-5 max-w-xl text-lg leading-relaxed text-brand-100/80" style={{ animationDelay: "260ms" }}>
              We build careers the same way we build projects, with craft, mentorship, and the expectation that people grow.
            </p>
          </div>
        </section>

        {/* Intro */}
        <section className="border-b border-concrete-200 bg-white">
          <div className="mx-auto max-w-8xl px-6 py-14 lg:px-10">
            <div className="grid max-w-5xl gap-8 lg:grid-cols-2">
              <Reveal direction="left">
                <p className="text-lg leading-relaxed text-concrete-600">
                  Pegah Construction has been building Ontario since 1988. Our team spans project management, site supervision, estimating, and administration, working together to deliver complex projects on time and on budget.
                </p>
              </Reveal>
              <Reveal direction="right" delay={100}>
                <p className="text-lg leading-relaxed text-concrete-600">
                  We value experience, safety culture, and a long-term mindset. Whether you are an experienced project manager or a skilled tradesperson, we want to hear from you.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Job listings */}
        <section className="mx-auto max-w-8xl px-6 py-20 lg:px-10">
          {jobs.length === 0 ? (
            /* Empty state */
            <Reveal>
              <div className="rounded-2xl border border-concrete-200 bg-white px-10 py-20 text-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="mx-auto h-12 w-12 text-concrete-300">
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                  <path d="M12 12v4m-2-2h4" />
                </svg>
                <h2 className="mt-5 font-display text-2xl font-bold text-ink">No open positions right now</h2>
                <p className="mx-auto mt-3 max-w-md text-concrete-500">
                  We don&rsquo;t have any openings listed at this time, but we&rsquo;re always interested in hearing from talented people. Send your resume and we&rsquo;ll keep you in mind.
                </p>
                <a
                  href={`mailto:${company.email}?subject=General Application to Pegah Construction`}
                  className="mt-8 inline-flex items-center gap-2 rounded-md bg-brand-700 px-6 py-3 font-display text-sm font-semibold text-white transition-colors hover:bg-brand-800"
                >
                  Send a general application →
                </a>
              </div>
            </Reveal>
          ) : (
            <>
              <Reveal>
                <div className="mb-12 flex items-end justify-between">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-label text-concrete-500">Open positions</p>
                    <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-ink lg:text-4xl">
                      {jobs.length} {jobs.length === 1 ? "opening" : "openings"}
                    </h2>
                  </div>
                </div>
              </Reveal>

              <div className="space-y-14">
                {depts.map((dept, di) => (
                  <Reveal key={dept} delay={di * 80}>
                    <div>
                      <h3 className="mb-4 font-mono text-[11px] uppercase tracking-label text-concrete-500">
                        {dept}
                      </h3>
                      <div className="divide-y divide-concrete-100 overflow-hidden rounded-xl border border-concrete-200 bg-white">
                        {byDept[dept].map((job) => (
                          <div key={job.id} className="px-6 py-6 sm:px-8">
                            <div className="flex flex-wrap items-start gap-3">
                              <div className="flex-1">
                                <h4 className="font-display text-xl font-bold text-ink">{job.title}</h4>
                                <div className="mt-1.5 flex flex-wrap items-center gap-3">
                                  <span className="flex items-center gap-1.5 font-mono text-xs text-concrete-500">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                      <circle cx="12" cy="10" r="3" />
                                    </svg>
                                    {job.location}
                                  </span>
                                  <span className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-label ${TYPE_STYLE[job.type] ?? TYPE_STYLE["Full-time"]}`}>
                                    {job.type}
                                  </span>
                                </div>
                              </div>
                              <a
                                href={`mailto:${company.email}?subject=Application: ${encodeURIComponent(job.title)}`}
                                className="shrink-0 rounded-md bg-brand-700 px-5 py-2.5 font-display text-sm font-semibold text-white transition-colors hover:bg-brand-800"
                              >
                                Apply now →
                              </a>
                            </div>

                            {job.description && (
                              <p className="mt-4 text-sm leading-relaxed text-concrete-600">
                                {job.description}
                              </p>
                            )}

                            {job.requirements && (
                              <div className="mt-4">
                                <p className="mb-2 font-mono text-[11px] uppercase tracking-label text-concrete-500">Requirements</p>
                                <ul className="space-y-1">
                                  {job.requirements.split("\n").filter(Boolean).map((r, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-concrete-600">
                                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                                      {r.replace(/^[-•*]\s*/, "")}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </>
          )}
        </section>

        {/* General application CTA */}
        <section className="bg-brand-900">
          <div className="mx-auto max-w-8xl px-6 py-20 lg:px-10">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <Reveal direction="left">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-label text-brand-300">Don&rsquo;t see a fit?</p>
                  <h2 className="mt-3 font-display text-4xl font-black tracking-tight text-white lg:text-5xl">
                    Send us your résumé
                  </h2>
                  <p className="mt-5 max-w-lg text-lg leading-relaxed text-brand-100/80">
                    We keep strong candidates on file and reach out when roles open that match your profile. Construction, estimating, project management, safety. We&rsquo;re always looking for good people.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-4">
                    <a
                      href={`mailto:${company.email}?subject=General Application to Pegah Construction`}
                      className="inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 font-display text-sm font-semibold text-brand-900 transition-colors hover:bg-brand-50"
                    >
                      Email your résumé →
                    </a>
                    <a
                      href={company.phoneHref}
                      className="inline-flex items-center gap-2 rounded-md border border-white/20 px-6 py-3 font-display text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/5"
                    >
                      {company.phone}
                    </a>
                  </div>
                </div>
              </Reveal>
              <Reveal direction="right" delay={100}>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { title: "Established 1988", desc: "Over 35 years of sustained growth in Ontario." },
                    { title: "Mentorship culture", desc: "Senior staff who invest in the next generation of builders." },
                    { title: "Diverse project types", desc: "Commercial, industrial, residential, institutional, and more." },
                    { title: "Safety first", desc: "A culture where every person goes home safe every day." },
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
