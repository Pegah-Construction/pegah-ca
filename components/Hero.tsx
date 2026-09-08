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
    <section className="relative isolate flex min-h-[82vh] items-end overflow-hidden">
      {/* Full-bleed background */}
      {paths.length > 0 ? (
        <HeroCarousel images={paths} />
      ) : (
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_60%_40%,theme(colors.brand.700),theme(colors.brand.900))]" />
      )}

      {/* The card is anchored to the bottom of the hero, clear of the building in
          the photo behind it. Bottom-aligning rather than padding it down also
          keeps it on screen on a short laptop: the gap it leaves shrinks with
          the viewport instead of pushing the card past the fold. The top padding
          only comes into play if the copy ever outgrows the hero. */}
      <div className="mx-auto w-full max-w-8xl px-5 pb-12 pt-24 sm:px-6 sm:pb-16 sm:pt-28 lg:px-10">
        <div className="hero-animate max-w-md bg-surface/95 p-5 shadow-xl ring-1 ring-black/5 backdrop-blur-sm dark:ring-white/10 sm:p-6 lg:p-8" style={{ animationDelay: "80ms" }}>
          <div className="accent-bar mb-4 sm:mb-5" />
          <p className="font-display text-xs font-bold uppercase tracking-[0.25em] text-concrete-500">
            {s.heroEyebrow}
          </p>
          {/* The title is editable, so it can be any length. break-words keeps a
              long single word (nothing to wrap at) inside the card instead of
              letting it run past the edge and get clipped. */}
          <h1 className="mt-3 whitespace-pre-line break-words font-display text-2xl font-black leading-[1.05] tracking-tight text-ink sm:text-3xl lg:text-4xl">
            {s.heroTitle}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-concrete-500 sm:mt-4 sm:text-base">
            {s.heroSubtitle}
          </p>
        </div>
      </div>
    </section>
  );
}
