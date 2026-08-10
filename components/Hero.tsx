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

      <div className="mx-auto w-full max-w-8xl px-5 py-16 sm:px-6 sm:py-20 lg:px-10">
        <div className="hero-animate max-w-lg bg-surface/95 p-6 shadow-xl ring-1 ring-black/5 backdrop-blur-sm dark:ring-white/10 sm:p-8 lg:p-10" style={{ animationDelay: "80ms" }}>
          <div className="accent-bar mb-5 sm:mb-6" />
          <p className="font-display text-xs font-bold uppercase tracking-[0.25em] text-concrete-500">
            {s.heroEyebrow}
          </p>
          {/* The title is editable, so it can be any length. break-words keeps a
              long single word (nothing to wrap at) inside the card instead of
              letting it run past the edge and get clipped. */}
          <h1 className="mt-4 whitespace-pre-line break-words font-display text-3xl font-black leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl">
            {s.heroTitle}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-concrete-500 sm:mt-5 sm:text-lg">
            {s.heroSubtitle}
          </p>
        </div>
      </div>
    </section>
  );
}
