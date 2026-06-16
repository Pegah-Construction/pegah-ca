import HeroCarousel from "./HeroCarousel";
import ImageSlot from "./ImageSlot";
import Button from "./Button";
import { Eyebrow } from "./Brand";
import { company } from "@/lib/site";
import { db } from "@/lib/db";

export default async function Hero() {
  const images = await db.heroImage.findMany({ orderBy: { order: "asc" } });
  const paths = images.map((img) => img.path);

  return (
    <section className="relative isolate flex min-h-[88vh] items-end overflow-hidden">
      {/* Full-bleed background */}
      {paths.length > 0 ? (
        <HeroCarousel images={paths} />
      ) : (
        <ImageSlot
          label="full-bleed hero — flagship project"
          dark
          className="absolute inset-0 -z-10 h-full w-full"
        />
      )}

      {/* Legibility gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-900/85 via-brand-900/35 to-brand-900/30" />

      <div className="mx-auto w-full max-w-8xl px-6 pb-28 pt-40 lg:px-10">
        <Eyebrow className="text-brand-200">
          General Contracting · Project Management
        </Eyebrow>
        <h1 className="mt-5 max-w-4xl font-display text-5xl font-black leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl">
          Building {company.region}
          <br />
          since {company.established}.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">
          An established general contracting and project-management firm
          delivering quality workmanship across commercial, industrial and
          institutional projects.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
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
