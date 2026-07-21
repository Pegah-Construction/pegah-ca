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
        <section className="hero-surface border-b border-concrete-200 pt-14">
          <div className="mx-auto max-w-8xl px-6 pb-14 lg:px-10">
            <Link href="/projects" className="font-body text-sm font-medium text-concrete-600 hover:text-brand-700">
              ← All projects
            </Link>
            {project.type && <Eyebrow className="mt-6">{project.type}</Eyebrow>}
            <h1 className="mt-3 max-w-4xl font-display text-4xl font-black tracking-tight text-ink lg:text-6xl">
              {project.name}
            </h1>
            {project.location && (
              <p className="mt-4 font-body text-base text-concrete-600">
                {project.location}{project.dateCompleted ? ` · Completed ${project.dateCompleted.slice(0, 4)}` : ""}
              </p>
            )}
          </div>
        </section>

        {/* Photo carousel or placeholder */}
        <div className="mx-auto max-w-4xl px-6 pt-12 lg:px-10">
          {photoPaths.length > 0 ? (
            <PhotoCarousel photos={photoPaths} imgClassName="aspect-[16/10]" className="shadow-xl" />
          ) : (
            <div className="aspect-[16/10] w-full rounded-2xl bg-concrete-100" />
          )}
        </div>

        {/* Project details + description */}
        <div className="mx-auto max-w-8xl px-6 py-16 lg:px-10">
          {facts.length > 0 && (
            <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-8 shadow-sm">
              <h2 className="border-b border-brand-200 pb-4 font-display text-sm font-bold uppercase tracking-wide text-brand-700">
                Project Details
              </h2>
              <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
                {facts.map(([k, v]) => (
                  <div key={k}>
                    <dt className="font-display text-sm font-bold uppercase tracking-wide text-brand-700">{k}</dt>
                    <dd className="mt-1 font-display text-xl font-bold text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="mt-10 max-w-3xl">
            {project.description ? (
              <p className="font-body text-lg leading-relaxed text-concrete-600">
                {project.description}
              </p>
            ) : (
              <p className="font-body text-lg text-concrete-400">No description available.</p>
            )}
          </div>
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
