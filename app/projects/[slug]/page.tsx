import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PhotoCarousel from "@/components/PhotoCarousel";
import { Eyebrow } from "@/components/Brand";
import { getStorageUrl } from "@/lib/storage-url";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = await db.project.findUnique({ where: { id: slug }, select: { name: true } });
  return {
    title: project
      ? `${project.name} | Pegah Construction Ltd.`
      : "Project | Pegah Construction Ltd.",
  };
}

export default async function ProjectDetail({ params }: Params) {
  const { slug } = await params;
  const project = await db.project.findUnique({
    where: { id: slug },
    include: { photos: { orderBy: { order: "asc" } } },
  });
  if (!project) notFound();

  const facts: [string, string][] = [
    project.location ? ["Location", project.location] : null,
    project.contractType ? ["Contract type", project.contractType] : null,
    project.value > 0 ? ["Contract value", "$" + project.value.toLocaleString("en-US")] : null,
    project.owner ? ["Owner", project.owner] : null,
    project.architect ? ["Architect", project.architect] : null,
    project.grossFloorArea ? ["Gross floor area", project.grossFloorArea] : null,
    project.dateCompleted ? ["Year completed", project.dateCompleted.slice(0, 4)] : null,
  ].filter((f): f is [string, string] => f !== null);

  const photoPaths = project.photos.map((ph) => getStorageUrl(ph.path));

  return (
    <>
      <Navbar />
      <main>
        {/* Header */}
        <section className="border-b border-concrete-200 bg-white pt-14">
          <div className="mx-auto max-w-8xl px-6 pb-14 lg:px-10">
            <Link href="/projects" className="font-mono text-xs text-concrete-500 hover:text-brand-700">
              ← All projects
            </Link>
            {project.type && <Eyebrow className="mt-6">{project.type}</Eyebrow>}
            <h1 className="mt-3 max-w-4xl font-display text-4xl font-black tracking-tight text-ink lg:text-6xl">
              {project.name}
            </h1>
            {project.location && (
              <p className="mt-4 font-mono text-sm text-concrete-500">
                {project.location}{project.dateCompleted ? ` · Completed ${project.dateCompleted.slice(0, 4)}` : ""}
              </p>
            )}
          </div>
        </section>

        {/* Photo carousel or placeholder */}
        <div className="mx-auto max-w-8xl px-6 pt-12 lg:px-10">
          {photoPaths.length > 0 ? (
            <PhotoCarousel photos={photoPaths} />
          ) : (
            <div className="aspect-[16/7] w-full rounded-2xl bg-concrete-100" />
          )}
        </div>

        {/* Body + facts */}
        <div className="mx-auto grid max-w-8xl gap-12 px-6 py-16 lg:grid-cols-12 lg:px-10">
          <div className="lg:col-span-7">
            {project.description ? (
              <p className="font-body text-lg leading-relaxed text-concrete-600">
                {project.description}
              </p>
            ) : (
              <p className="font-body text-lg text-concrete-400">No description available.</p>
            )}
          </div>

          {facts.length > 0 && (
            <aside className="lg:col-span-4 lg:col-start-9">
              <div className="rounded-xl border border-concrete-200 bg-paper p-7">
                <h2 className="font-mono text-[11px] uppercase tracking-label text-concrete-500">
                  Project facts
                </h2>
                <dl className="mt-4 divide-y divide-concrete-200">
                  {facts.map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 py-3">
                      <dt className="font-body text-concrete-500">{k}</dt>
                      <dd className="text-right font-display font-semibold text-ink">{v}</dd>
                    </div>
                  ))}
                </dl>
                <Link
                  href="/contact"
                  className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-brand-700 px-5 py-3 font-display text-sm font-semibold text-white hover:bg-brand-800"
                >
                  Start a project like this →
                </Link>
              </div>
            </aside>
          )}
        </div>

        {/* Back to projects */}
        <section className="border-t border-concrete-200 bg-white">
          <div className="mx-auto flex max-w-8xl items-center justify-center px-6 py-14 lg:px-10">
            <Link
              href="/projects"
              className="font-display text-sm font-semibold text-brand-700 hover:text-brand-800"
            >
              ← Back to all projects
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
