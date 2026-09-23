import { Eyebrow } from "./Brand";
import Reveal from "./Reveal";
import { getSiteSettings } from "@/lib/settings-server";
import { isOn, parseTestimonials } from "@/lib/settings";

/**
 * Client references on the home page, driven by the dashboard: the quotes, the
 * eyebrow and the heading are all editable, and the whole band can be hidden
 * without deleting the references. An empty list hides it too, rather than
 * leaving a heading with nothing under it.
 */
export default async function Testimonials() {
  const s = await getSiteSettings();
  if (!isOn(s.testimonialsVisible)) return null;

  const testimonials = parseTestimonials(s.testimonialsList);
  if (testimonials.length === 0) return null;

  return (
    <section className="grid-surface border-t border-concrete-200">
      <div className="mx-auto max-w-8xl px-5 py-16 sm:px-6 sm:py-24 lg:px-10">
        <Reveal>
          <div className="accent-bar mb-4" />
          <Eyebrow>{s.testimonialsEyebrow}</Eyebrow>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight text-ink lg:text-4xl">
            {s.testimonialsHeading}
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={`${t.name}-${i}`} delay={i * 90} direction="up" className="h-full">
              <figure className="flex h-full flex-col rounded-xl border border-concrete-200 bg-surface p-7">
                {/* Decorative: the quote is already marked up as one, so this
                    glyph is hidden from a screen reader rather than read out. */}
                <span
                  aria-hidden
                  className="font-display text-5xl font-black leading-none text-brand-200"
                >
                  &ldquo;
                </span>
                <blockquote className="mt-3 flex-1 text-lg leading-relaxed text-concrete-600">
                  {t.quote}
                </blockquote>
                {(t.name || t.org) && (
                  <figcaption className="mt-6 border-t border-concrete-200 pt-4">
                    {t.name && <p className="font-display font-semibold text-ink">{t.name}</p>}
                    {t.org && (
                      <p className="mt-0.5 font-mono text-[11px] uppercase tracking-label text-accent-700">
                        {t.org}
                      </p>
                    )}
                  </figcaption>
                )}
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
