import { Eyebrow } from "@/components/Brand";
import ServiceImage from "@/components/ServiceImage";
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
 * TEMPORARY — delete this folder once the service card photos are settled.
 *
 * Renders the live services section with each card's uploaded photo ignored, so
 * the bundled photos in public/services can be seen in place without changing
 * anything in the database. The real section is components/ServicesList.tsx;
 * this mirrors it so the preview uses the same classes and the same widened
 * card gaps.
 */
export const dynamic = "force-dynamic";

export default async function PreviewServices() {
  const settings = await getSiteSettings();
  // The whole point of the preview: drop the image field from every line so
  // ServiceImage falls through to /services/<slug>.jpg.
  const services = parseServices(settings.servicesList).map((s) => ({ ...s, image: "" }));

  const pick = (map: Record<string, string>, value: string, fallback: string) =>
    map[value] ?? map[fallback];

  const cardWidth = pick(SERVICE_CARD_WIDTH_CLASSES, settings.servicesColumns, "2");
  const background = pick(SERVICE_BACKGROUND_CLASSES, settings.servicesBackground, "tint");
  const spacing = pick(SERVICE_SPACING_CLASSES, settings.servicesSpacing, "normal");
  const headingSize = pick(SERVICE_HEADING_CLASSES, settings.servicesHeadingSize, "medium");
  const align = SERVICE_ALIGN_CLASSES[settings.servicesAlign] ?? SERVICE_ALIGN_CLASSES.left;

  return (
    <main>
      <p className="bg-ink px-5 py-3 text-center text-sm text-white">
        preview only — the live site is unchanged. each card is showing the photo that ships in
        public/services, because the uploaded photo is ignored here.
      </p>
      <section className={`${background} scroll-mt-24`}>
        <div className={`mx-auto max-w-8xl px-5 sm:px-6 lg:px-10 ${spacing}`}>
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

          <div className="mt-12 flex flex-wrap justify-center gap-x-16 gap-y-14 sm:gap-y-16 lg:gap-x-24 lg:gap-y-20">
            {services.map((s, i) => (
              <div key={`${s.slug}-${i}`} className={cardWidth}>
                <article className={`group h-full ${align.text}`}>
                  <ServiceImage
                    src=""
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
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
