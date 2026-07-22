import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import Reveal from "@/components/Reveal";
import { db } from "@/lib/db";
import { getStorageUrl } from "@/lib/storage-url";
import { mergeSafetyContent, toParagraphs, toLines, toPairs } from "@/lib/safety-content";

export const metadata: Metadata = {
  title: "Health & Safety | Pegah Construction Ltd.",
};

export default async function SafetyPage() {
  const [row, imageRow] = await Promise.all([
    db.setting.findUnique({ where: { key: "safety_content" } }),
    db.setting.findUnique({ where: { key: "safety_image" } }),
  ]);
  const c = mergeSafetyContent(row?.value);
  const safetyImg = imageRow?.value ? getStorageUrl(imageRow.value) : "/health%20and%20safety.jpg";

  const stats = toPairs(c.stats);
  const policy = toPairs(c.policy);
  const duties = toLines(c.duties);
  const certs = toPairs(c.certifications);
  const resources = toPairs(c.resources);

  return (
    <PageShell eyebrow="Health, Safety & Environment" title="Health & Safety" intro={c.intro}>
      {/* Stats banner */}
      {stats.length > 0 && (
        <Reveal>
          <div className="grid grid-cols-2 gap-4 rounded-2xl border border-brand-100 bg-brand-50/50 p-6 sm:p-8 lg:grid-cols-4">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="font-display text-3xl font-black tracking-tight text-brand-700 lg:text-4xl">{s.a}</div>
                <div className="mt-1 font-mono text-[11px] uppercase tracking-label text-concrete-500">{s.b}</div>
              </div>
            ))}
          </div>
        </Reveal>
      )}

      {/* Our HSE Commitment */}
      <section className="mt-16">
        <Reveal>
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="accent-bar mb-4" />
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink lg:text-3xl">Our HSE Commitment</h2>
              <div className="mt-4 space-y-4 text-lg leading-relaxed text-concrete-600">
                {toParagraphs(c.commitment).map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={safetyImg} alt="Pegah Construction health & safety on site" className="w-full rounded-2xl object-cover shadow-lg" />
          </div>
        </Reveal>
      </section>

      {/* Our Policy Statement */}
      {policy.length > 0 && (
        <section className="mt-16">
          <Reveal>
            <div className="accent-bar mb-4" />
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink lg:text-3xl">Our Policy Statement</h2>
          </Reveal>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {policy.map((p, i) => (
              <Reveal key={i} delay={(i % 2) * 80} direction="up">
                <div className="card-elevated h-full p-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-700 font-display text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    <h3 className="font-display text-lg font-bold tracking-tight text-ink">{p.a}</h3>
                  </div>
                  <p className="mt-3 leading-relaxed text-concrete-600">{p.b}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Key Duties as Constructor */}
      {duties.length > 0 && (
        <section className="mt-16">
          <Reveal>
            <div className="accent-bar mb-4" />
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink lg:text-3xl">Key Duties as Constructor</h2>
            <ul className="mt-6 grid max-w-4xl gap-3 sm:grid-cols-2">
              {duties.map((d, i) => (
                <li key={i} className="flex items-start gap-3 leading-relaxed text-concrete-600">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mt-0.5 h-5 w-5 shrink-0 text-brand-600">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </section>
      )}

      {/* Program Evaluation */}
      <section className="mt-16">
        <Reveal>
          <div className="accent-bar mb-4" />
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink lg:text-3xl">Program Evaluation</h2>
          <div className="mt-4 max-w-3xl space-y-4 text-lg leading-relaxed text-concrete-600">
            {toParagraphs(c.programEval).map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </Reveal>
      </section>

      {/* Certifications & Recognition */}
      {certs.length > 0 && (
        <section className="mt-16">
          <Reveal>
            <div className="accent-bar mb-4" />
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink lg:text-3xl">Certifications &amp; Recognition</h2>
          </Reveal>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            {certs.map((c2, i) => (
              <Reveal key={i} delay={(i % 3) * 80} direction="up">
                <div className="card-elevated h-full p-6">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-8 w-8 text-brand-600">
                    <path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 7.7l5.4-.8z" />
                  </svg>
                  <h3 className="mt-4 font-display text-lg font-bold tracking-tight text-ink">{c2.a}</h3>
                  <p className="mt-2 leading-relaxed text-concrete-600">{c2.b}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Health & Safety Resources */}
      {resources.length > 0 && (
        <section className="mt-16">
          <Reveal>
            <div className="accent-bar mb-4" />
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink lg:text-3xl">Health &amp; Safety Resources</h2>
          </Reveal>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {resources.map((r, i) => (
              <a
                key={i}
                href={r.b || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-3 rounded-xl border border-concrete-200 bg-white px-5 py-4 transition-colors hover:border-brand-300 hover:bg-brand-50/40"
              >
                <span className="font-display font-semibold text-ink group-hover:text-brand-700">{r.a}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 shrink-0 text-concrete-400 group-hover:text-brand-700">
                  <path d="M7 17 17 7M7 7h10v10" />
                </svg>
              </a>
            ))}
          </div>
        </section>
      )}
    </PageShell>
  );
}
