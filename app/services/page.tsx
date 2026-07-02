import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import Reveal from "@/components/Reveal";
import { services } from "@/lib/site";

export const metadata: Metadata = {
  title: "Services — Pegah Construction Ltd.",
};

export default function ServicesPage() {
  return (
    <PageShell
      eyebrow="What we do"
      title="Services"
      intro="From initial concept through to long-term care, we manage every stage of delivery."
    >
      <div className="grid gap-px overflow-hidden rounded-xl border border-concrete-200 bg-concrete-200 sm:grid-cols-2">
        {services.map((s, i) => (
          <Reveal key={s.title} delay={i * 80} direction="up">
            <div id={s.slug} className="h-full bg-white p-8">
              <span className="font-mono text-xs text-concrete-400">0{i + 1}</span>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink">{s.title}</h2>
              <p className="mt-3 leading-relaxed text-concrete-500">{s.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </PageShell>
  );
}
