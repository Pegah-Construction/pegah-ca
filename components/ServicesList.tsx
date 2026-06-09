import Link from "next/link";
import { Eyebrow } from "./Brand";
import { services } from "@/lib/site";

export default function ServicesList() {
  return (
    <section className="mx-auto max-w-8xl px-6 py-24 lg:px-10 lg:py-28">
      <Eyebrow>What we do</Eyebrow>
      <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight text-ink lg:text-4xl">
        Four ways we deliver your project.
      </h2>

      <div className="mt-12 grid gap-x-12 sm:grid-cols-2">
        {services.map((s, i) => (
          <Link
            key={s.title}
            href={`/services#${s.slug}`}
            className="group flex items-start justify-between gap-6 border-t border-concrete-200 py-7 transition-colors hover:border-brand-300"
          >
            <div>
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-xs text-concrete-400">
                  0{i + 1}
                </span>
                <h3 className="font-display text-xl font-bold tracking-tight text-ink group-hover:text-brand-700">
                  {s.title}
                </h3>
              </div>
              <p className="mt-2 max-w-sm leading-relaxed text-concrete-500">
                {s.desc}
              </p>
            </div>
            <span className="mt-1 font-display text-xl text-concrete-300 transition-transform group-hover:translate-x-1 group-hover:text-brand-700">
              →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
