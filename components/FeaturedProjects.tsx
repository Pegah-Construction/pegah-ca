import Link from "next/link";
import ImageSlot from "./ImageSlot";
import { Eyebrow } from "./Brand";
import { featuredProjects } from "@/lib/site";

export default function FeaturedProjects() {
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
          {featuredProjects.map((p, i) => {
            const flipped = i % 2 === 1;
            return (
              <article
                key={p.slug}
                className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14"
              >
                <Link
                  href={`/projects/${p.slug}`}
                  className={`group block ${flipped ? "lg:order-2" : ""}`}
                >
                  <ImageSlot
                    label="project photo"
                    className="aspect-[4/3] w-full rounded-xl transition-opacity group-hover:opacity-90"
                  />
                </Link>
                <div className={flipped ? "lg:order-1" : ""}>
                  <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 font-mono text-[11px] uppercase tracking-label text-brand-700">
                    {p.sector}
                  </span>
                  <h3 className="mt-4 font-display text-2xl font-bold tracking-tight text-ink lg:text-3xl">
                    <Link
                      href={`/projects/${p.slug}`}
                      className="hover:text-brand-700"
                    >
                      {p.name}
                    </Link>
                  </h3>
                  <p className="mt-3 max-w-md text-lg leading-relaxed text-concrete-500">
                    {p.summary}
                  </p>
                  <Link
                    href={`/projects/${p.slug}`}
                    className="mt-5 inline-flex font-display text-sm font-semibold text-brand-700 hover:text-brand-800"
                  >
                    View case study →
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
