import HeroCarousel from "./HeroCarousel";
import { db } from "@/lib/db";
import { getStorageUrl } from "@/lib/storage-url";
import { getSiteSettings } from "@/lib/settings-server";

export default async function Hero() {
  const [images, s] = await Promise.all([
    db.heroImage.findMany({ orderBy: { order: "asc" } }),
    getSiteSettings(),
  ]);
  const paths = images.map((img) => getStorageUrl(img.path));

  return (
    <section className="relative isolate flex min-h-[82vh] items-center overflow-hidden">
      {/* Full-bleed background */}
      {paths.length > 0 ? (
        <HeroCarousel images={paths} />
      ) : (
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_60%_40%,theme(colors.brand.700),theme(colors.brand.900))]" />
      )}

      <div className="mx-auto w-full max-w-8xl px-6 py-20 lg:px-10">
        <div className="hero-animate max-w-lg bg-white p-8 shadow-2xl sm:p-10" style={{ animationDelay: "80ms" }}>
          <p className="font-display text-xs font-bold uppercase tracking-[0.25em] text-concrete-500">
            {s.heroEyebrow}
          </p>
          <h1 className="mt-4 whitespace-pre-line font-display text-5xl font-black leading-[1.03] tracking-tight text-ink sm:text-6xl">
            {s.heroTitle}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-concrete-600">
            {s.heroSubtitle}
          </p>
        </div>
      </div>
    </section>
  );
}
