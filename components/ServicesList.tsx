import { Eyebrow } from "./Brand";
import Reveal from "./Reveal";
import ServiceImage from "./ServiceImage";
import { getSiteSettings } from "@/lib/settings-server";
import { fillCount, parseServices } from "@/lib/settings";

/**
 * The services section — the only place services are shown, so it carries the
 * intro copy that used to sit on the (now removed) /services page. `id` makes
 * it the target of the "Services" nav link.
 */
export default async function ServicesList() {
  const settings = await getSiteSettings();
  const services = parseServices(settings.servicesList);
  if (services.length === 0) return null;
  return (
    <section id="services" className="tint-grid-surface scroll-mt-24">
      <div className="mx-auto max-w-8xl px-5 py-16 sm:px-6 sm:py-24 lg:px-10 lg:py-28">
        <Reveal>
          <div className="accent-bar mb-4" />
          <Eyebrow>{settings.servicesEyebrow}</Eyebrow>
          <h2 className="mt-3 max-w-3xl font-display text-3xl font-bold tracking-tight text-ink lg:text-4xl">
            {fillCount(settings.servicesHomeHeading, services.length)}
          </h2>
          {settings.servicesIntro ? (
            <p className="mt-5 max-w-3xl leading-relaxed text-concrete-500 lg:text-lg">
              {settings.servicesIntro}
            </p>
          ) : null}
        </Reveal>

        {/* Image card per service: photo, then title, then the one-line
            description — four across on desktop, two on tablet, one on a phone. */}
        <div className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <Reveal key={`${s.slug}-${i}`} delay={i * 80} direction="up">
              <article className="group h-full">
                <ServiceImage src={s.image} title={s.title} index={i} />
                <h3 className="mt-5 font-display text-xl font-bold tracking-tight text-ink transition-colors group-hover:text-brand-700 lg:text-lg">
                  {s.title}
                </h3>
                {s.desc ? (
                  <p className="mt-2 text-sm leading-relaxed text-concrete-500">{s.desc}</p>
                ) : null}
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
