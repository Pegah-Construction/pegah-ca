import HeroCarousel from "./HeroCarousel";
import Button from "./Button";
import { Eyebrow } from "./Brand";
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
    <section className="relative isolate flex min-h-[88vh] items-end overflow-hidden">
      {/* Full-bleed background */}
      {paths.length > 0 ? (
        <HeroCarousel images={paths} />
      ) : (
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_60%_40%,theme(colors.brand.700),theme(colors.brand.900))]" />
      )}

      {/* Legibility gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-900/85 via-brand-900/35 to-brand-900/30" />

      <div className="mx-auto w-full max-w-8xl px-6 pb-28 pt-40 lg:px-10">
        <Eyebrow className="hero-animate text-brand-200" style={{ animationDelay: "0ms" }}>
          {s.heroEyebrow}
        </Eyebrow>
        <h1 className="hero-animate mt-5 max-w-4xl whitespace-pre-line font-display text-5xl font-black leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl" style={{ animationDelay: "120ms" }}>
          {s.heroTitle}
        </h1>
        <p className="hero-animate mt-6 max-w-xl text-lg leading-relaxed text-white/80" style={{ animationDelay: "260ms" }}>
          {s.heroSubtitle}
        </p>
        <div className="hero-animate mt-9 flex flex-wrap gap-3" style={{ animationDelay: "380ms" }}>
          <Button href="/projects" variant="solid">
            View our work →
          </Button>
          <Button href="/contact" variant="ghost-light">
            Talk to us
          </Button>
        </div>
      </div>
    </section>
  );
}
