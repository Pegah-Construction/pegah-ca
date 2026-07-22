import Link from "next/link";
import { Eyebrow } from "./Brand";
import Reveal from "./Reveal";
import { services } from "@/lib/site";

export default function ServicesList() {
  return (
    <section className="mx-auto max-w-8xl px-6 py-24 lg:px-10 lg:py-28">
      <Reveal>
        <Eyebrow>What we do</Eyebrow>
        <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight text-ink lg:text-4xl">
          Four ways we deliver your project.
        </h2>
      </Reveal>

      <div className="mt-12 grid gap-x-12 sm:grid-cols-2">
        {services.map((s, i) => (
          <Reveal key={s.title} delay={i * 80} direction="up">
            <div className="border-t border-concrete-200 py-7">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-xs text-concrete-400">0{i + 1}</span>
                <h3 className="font-display text-xl font-bold tracking-tight text-ink">{s.title}</h3>
              </div>
              <p className="mt-2 max-w-sm leading-relaxed text-concrete-500">{s.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <Link
          href="/services"
          className="mt-12 inline-flex items-center gap-2 rounded-md bg-brand-700 px-6 py-3 font-display text-sm font-semibold text-white transition-colors hover:bg-brand-800"
        >
          View all services
          <span aria-hidden="true">→</span>
        </Link>
      </Reveal>
    </section>
  );
}
