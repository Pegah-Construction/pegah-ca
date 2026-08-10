import Link from "next/link";
import { Eyebrow } from "./Brand";
import Reveal from "./Reveal";
import { getSiteSettings } from "@/lib/settings-server";
import { fillCount, parseServices } from "@/lib/settings";

export default async function ServicesList() {
  const settings = await getSiteSettings();
  const services = parseServices(settings.servicesList);
  if (services.length === 0) return null;
  return (
    <section className="tint-grid-surface">
      <div className="mx-auto max-w-8xl px-5 py-16 sm:px-6 sm:py-24 lg:px-10 lg:py-28">
        <Reveal>
          <div className="accent-bar mb-4" />
          <Eyebrow>{settings.servicesEyebrow}</Eyebrow>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight text-ink lg:text-4xl">
            {fillCount(settings.servicesHomeHeading, services.length)}
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {services.map((s, i) => (
            <Reveal key={s.title} delay={i * 80} direction="up">
              <div className="card-elevated h-full p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-700 font-display text-base font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-display text-xl font-bold tracking-tight text-ink">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-concrete-500">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <Link
            href="/services"
            className="mt-12 inline-flex items-center gap-2 rounded-md bg-brand-700 px-6 py-3 font-display text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-brand-800"
          >
            View all services
            <span aria-hidden="true">→</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
