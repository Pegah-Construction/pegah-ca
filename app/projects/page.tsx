import type { Metadata } from "next";
import { db } from "@/lib/db";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProjectFilter, { type PublicProject } from "@/components/ProjectFilter";
import { getStorageUrl } from "@/lib/storage-url";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projects",
  description: "Explore Pegah Construction's portfolio of ICI and residential projects delivered across Ontario since 1988.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const rows = await db.project.findMany({
    // The portfolio is a visual page — a project with no photo renders as an
    // empty grey box — so only projects carrying at least one photo are listed.
    // The row filter skips the obvious cases; the check after mapping catches a
    // photo row whose stored path is blank and so resolves to no URL.
    where: { photos: { some: {} } },
    select: {
      id: true,
      name: true,
      location: true,
      category: true,
      type: true,
      dateCompleted: true,
      value: true,
      photos: {
        orderBy: { order: "asc" },
        select: { path: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const projects: PublicProject[] = rows
    .map((p) => ({
      id: p.id,
      name: p.name,
      location: p.location,
      category: p.category,
      type: p.type,
      dateCompleted: p.dateCompleted,
      value: p.value,
      photos: p.photos.map((ph) => getStorageUrl(ph.path)).filter(Boolean),
    }))
    .filter((p) => p.photos.length > 0);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <ProjectFilter projects={projects} />
      </main>
      <Footer />
    </>
  );
}
