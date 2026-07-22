import Link from "next/link";
import { Eyebrow } from "./Brand";
import { db } from "@/lib/db";
import PhotoCarousel from "./PhotoCarousel";
import Reveal from "./Reveal";
import { getStorageUrl } from "@/lib/storage-url";

export default async function FeaturedProjects() {
  // Pick 3 random projects that have at least one photo: shuffle their ids, take three.
  const ids = (
    await db.project.findMany({ where: { photos: { some: {} } }, select: { id: true } })
  ).map((p) => p.id);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  const pick = ids.slice(0, 3);

  const projects = await db.project.findMany({
    where: { id: { in: pick } },
    select: {
      id: true,
      name: true,
      type: true,
      location: true,
      description: true,
      photos: { orderBy: { order: "asc" }, select: { path: true } },
    },
  });

  if (projects.length === 0) return null;

  return (
    <section className="grid-surface border-y border-concrete-200">
      <div className="mx-auto max-w-8xl px-6 py-24 lg:px-10 lg:py-28">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="accent-bar mb-4" />
              <Eyebrow>Featured projects</Eyebrow>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink lg:text-4xl">
                Work we&rsquo;re proud to show.
              </h2>
            </div>
            <Link
              href="/projects"
              className="font-display text-sm font-semibold text-brand-700 hover:text-brand-800"
            >
              See all projects →
            </Link>
          </div>
        </Reveal>

        <div className="mt-14 space-y-16">
          {projects.map((p, i) => {
            const flipped = i % 2 === 1;
            const photos = p.photos.map((ph) => getStorageUrl(ph.path));
            return (
              <Reveal key={p.id} delay={i * 120} direction="up">
                <article className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
                  <div className={flipped ? "lg:order-2" : ""}>
                    {photos.length > 1 ? (
                      <PhotoCarousel photos={photos} imgClassName="aspect-[4/3]" className="img-card" />
                    ) : photos.length === 1 ? (
                      <Link href={`/projects/${p.id}`} className="block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photos[0]}
                          alt={p.name}
                          className="img-card aspect-[4/3] w-full rounded-xl object-cover"
                        />
                      </Link>
                    ) : (
                      <Link href={`/projects/${p.id}`} className="block">
                        <div className="img-card aspect-[4/3] w-full rounded-xl bg-concrete-100" />
                      </Link>
                    )}
                  </div>
                  <div className={flipped ? "lg:order-1" : "lg:order-2"}>
                    {p.type && (
                      <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 font-mono text-[11px] uppercase tracking-label text-brand-700">
                        {p.type}
                      </span>
                    )}
                    <h3 className="mt-4 font-display text-2xl font-bold tracking-tight text-ink lg:text-3xl">
                      <Link href={`/projects/${p.id}`} className="hover:text-brand-700">
                        {p.name}
                      </Link>
                    </h3>
                    {p.description && (
                      <p className="mt-3 max-w-md text-lg leading-relaxed text-concrete-500">
                        {p.description.length > 160
                          ? p.description.slice(0, 160).trimEnd() + "…"
                          : p.description}
                      </p>
                    )}
                    {p.location && (
                      <p className="mt-2 font-mono text-sm text-concrete-400">{p.location}</p>
                    )}
                    <Link
                      href={`/projects/${p.id}`}
                      className="mt-5 inline-flex font-display text-sm font-semibold text-brand-700 hover:text-brand-800"
                    >
                      View project →
                    </Link>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
