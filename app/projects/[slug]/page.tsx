import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ImageSlot from "@/components/ImageSlot";
import { Eyebrow } from "@/components/Brand";
import { projects } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  return {
    title: project
      ? `${project.name} — Pegah Construction Ltd.`
      : "Project — Pegah Construction Ltd.",
  };
}

export default async function ProjectDetail({ params }: Params) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  const index = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[(index + 1) % projects.length];

  const facts: [string, string][] = [
    ["Location", project.location],
    ["Year", project.year],
    ["Sector", project.sector],
    ["Services", project.services],
    ["Size / Value", project.size],
  ];

  return (
    <>
      <Navbar />
      <main>
        {/* Header */}
        <section className="border-b border-concrete-200 bg-white pt-14">
          <div className="mx-auto max-w-8xl px-6 pb-14 lg:px-10">
            <Link
              href="/projects"
              className="font-mono text-xs text-concrete-500 hover:text-brand-700"
            >
              ← All projects
            </Link>
            <Eyebrow className="mt-6">{project.sector}</Eyebrow>
            <h1 className="mt-3 max-w-4xl font-display text-4xl font-black tracking-tight text-ink lg:text-6xl">
              {project.name}
            </h1>
            <p className="mt-4 font-mono text-sm text-concrete-500">
              {project.location} · {project.year}
            </p>
          </div>
        </section>

        {/* Hero image */}
        <div className="mx-auto max-w-8xl px-6 pt-12 lg:px-10">
          <ImageSlot
            label="project hero photo"
            className="aspect-[16/7] w-full rounded-2xl"
          />
        </div>

        {/* Body + facts */}
        <div className="mx-auto grid max-w-8xl gap-12 px-6 py-16 lg:grid-cols-12 lg:px-10">
          <div className="lg:col-span-7">
            <p className="font-display text-2xl font-bold leading-snug tracking-tight text-ink">
              {project.summary}
            </p>
            <div className="mt-6 space-y-5">
              {project.description.map((para, i) => (
                <p
                  key={i}
                  className="text-lg leading-relaxed text-concrete-500"
                >
                  {para}
                </p>
              ))}
            </div>
          </div>

          <aside className="lg:col-span-4 lg:col-start-9">
            <div className="rounded-xl border border-concrete-200 bg-paper p-7">
              <h2 className="font-mono text-[11px] uppercase tracking-label text-concrete-500">
                Project facts
              </h2>
              <dl className="mt-4 divide-y divide-concrete-200">
                {facts.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 py-3">
                    <dt className="font-body text-concrete-500">{k}</dt>
                    <dd className="text-right font-display font-semibold text-ink">
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
              {project.sector === "Residential" && (
                <div className="mt-6 border-t border-concrete-200 pt-6">
                  <p className="font-mono text-[11px] uppercase tracking-label text-concrete-500">
                    Development partner
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element -- local SVG, no optimization needed */}
                  <img
                    src="/format-logo.svg"
                    alt="Format"
                    className="mt-3 h-10 w-auto rounded-md"
                  />
                </div>
              )}
              <Link
                href="/contact"
                className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-brand-700 px-5 py-3 font-display text-sm font-semibold text-white hover:bg-brand-800"
              >
                Start a project like this →
              </Link>
            </div>
          </aside>
        </div>

        {/* Gallery */}
        <div className="mx-auto max-w-8xl px-6 pb-20 lg:px-10">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: project.gallery }).map((_, i) => (
              <ImageSlot
                key={i}
                label="project photo"
                className="aspect-[4/3] rounded-xl"
              />
            ))}
          </div>
        </div>

        {/* Next project */}
        <section className="border-t border-concrete-200 bg-white">
          <div className="mx-auto flex max-w-8xl flex-col gap-4 px-6 py-14 sm:flex-row sm:items-center sm:justify-between lg:px-10">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-label text-concrete-500">
                Next project
              </p>
              <Link
                href={`/projects/${next.slug}`}
                className="mt-2 inline-block font-display text-2xl font-bold tracking-tight text-ink hover:text-brand-700"
              >
                {next.name} →
              </Link>
            </div>
            <Link
              href="/projects"
              className="font-display text-sm font-semibold text-brand-700 hover:text-brand-800"
            >
              Back to all projects
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
