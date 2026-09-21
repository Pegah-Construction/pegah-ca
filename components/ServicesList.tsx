import { Eyebrow } from "./Brand";
import Reveal from "./Reveal";
import ServiceImage from "./ServiceImage";
import { getSiteSettings } from "@/lib/settings-server";
import {
  fillCount,
  isOn,
  parseServices,
  SERVICE_ALIGN_CLASSES,
  SERVICE_BACKGROUND_CLASSES,
  SERVICE_CARD_WIDTH_CLASSES,
  SERVICE_HEADING_CLASSES,
  SERVICE_SPACING_CLASSES,
} from "@/lib/settings";

/**
 * The services section — the only place services are shown, so it carries the
 * intro copy that used to sit on the (now removed) /services page. `id` makes
 * it the target of the "Services" nav link.
 *
 * Everything here is driven by the dashboard: the copy and the service list, and
 * every layout choice below. A stored value can never be interpolated into a
 * class name (Tailwind only builds classes it can literally see), so each
 * setting selects a literal from a map in lib/settings.
 */
export default async function ServicesList() {
  const settings = await getSiteSettings();
  const services = parseServices(settings.servicesList);
  if (services.length === 0) return null;
  // Hidden from the dashboard without having to delete the content itself.
  if (!isOn(settings.servicesVisible)) return null;

  const pick = (map: Record<string, string>, value: string, fallback: string) =>
    map[value] ?? map[fallback];

  const cardWidth = pick(SERVICE_CARD_WIDTH_CLASSES, settings.servicesColumns, "2");
  const background = pick(SERVICE_BACKGROUND_CLASSES, settings.servicesBackground, "tint");
  const spacing = pick(SERVICE_SPACING_CLASSES, settings.servicesSpacing, "normal");
  const headingSize = pick(SERVICE_HEADING_CLASSES, settings.servicesHeadingSize, "medium");
  const align = SERVICE_ALIGN_CLASSES[settings.servicesAlign] ?? SERVICE_ALIGN_CLASSES.left;
  const animate = isOn(settings.servicesAnimate);

  const header = (
    <div className={align.text}>
      {isOn(settings.servicesAccentBar) && <div className={`accent-bar mb-4 ${align.bar}`} />}
      <Eyebrow>{settings.servicesEyebrow}</Eyebrow>
      <h2
        className={`mt-3 font-display font-bold tracking-tight text-ink ${headingSize} ${align.block}`}
      >
        {fillCount(settings.servicesHomeHeading, services.length)}
      </h2>
      {settings.servicesIntro ? (
        <p className={`mt-5 leading-relaxed text-concrete-500 lg:text-lg ${align.block}`}>
          {settings.servicesIntro}
        </p>
      ) : null}
    </div>
  );

  return (
    <section id="services" className={`${background} scroll-mt-24`}>
      <div className={`mx-auto max-w-8xl px-5 sm:px-6 lg:px-10 ${spacing}`}>
        {animate ? <Reveal>{header}</Reveal> : header}

        {/* Image card per service: photo, then title, then the one-line
            description. Cards per row is set in the dashboard; a phone always
            gets one. Wrapping flex rather than a grid so a last row that isn't
            full sits centred instead of hugging the left edge. */}
        <div className="mt-12 flex flex-wrap justify-center gap-x-16 gap-y-14 sm:gap-y-16 lg:gap-x-24 lg:gap-y-20">
          {services.map((s, i) => {
            const card = (
              <article className={`group h-full ${align.text}`}>
                <ServiceImage
                  src={s.image}
                  title={s.title}
                  index={i}
                  slug={s.slug}
                  shape={settings.servicesImageShape}
                  zoom={isOn(settings.servicesImageZoom)}
                />
                <h3 className="mt-5 font-display text-xl font-bold tracking-tight text-ink transition-colors group-hover:text-brand-700 lg:text-lg">
                  {s.title}
                </h3>
                {s.desc ? (
                  <p className="mt-2 text-sm leading-relaxed text-concrete-500">{s.desc}</p>
                ) : null}
              </article>
            );
            return animate ? (
              <Reveal key={`${s.slug}-${i}`} delay={i * 80} direction="up" className={cardWidth}>
                {card}
              </Reveal>
            ) : (
              <div key={`${s.slug}-${i}`} className={cardWidth}>{card}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
