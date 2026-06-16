import Link from "next/link";
import { Eyebrow } from "./Brand";
import { db } from "@/lib/db";
import PhotoCarousel from "./PhotoCarousel";

export default async function FeaturedProjects() {
  const projects = await db.project.findMany({
    take: 3,
    orderBy: { id: "desc" },
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
    <section className="border-y border-concrete-200 bg-white">
      <div className="mx-auto max-w-8xl px-6 py-24 lg:px-10 lg:py-28">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
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

        <div className="mt-14 space-y-16">
          {projects.map((p, i) => {
            const flipped = i % 2 === 1;
            const photos = p.photos.map((ph) => ph.path);
            return (
              <article key={p.id} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
                <div className={flipped ? "lg:order-2" : ""}>
                  {photos.length > 1 ? (
                    <PhotoCarousel photos={photos} imgClassName="aspect-[4/3]" />
                  ) : photos.length === 1 ? (
                    <Link href={`/projects/${p.id}`} className="group block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photos[0]}
                        alt={p.name}
                        className="aspect-[4/3] w-full rounded-xl object-cover transition-opacity group-hover:opacity-90"
                      />
                    </Link>
                  ) : (
                    <Link href={`/projects/${p.id}`} className="group block">
                      <div className="aspect-[4/3] w-full rounded-xl bg-concrete-100 transition-opacity group-hover:opacity-90" />
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
            );
          })}
        </div>
      </div>
    </section>
  );
}
