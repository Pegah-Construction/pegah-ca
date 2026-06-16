import type { Metadata } from "next";
import { db } from "@/lib/db";
import PageShell from "@/components/PageShell";
import ProjectFilter, { type PublicProject } from "@/components/ProjectFilter";

export const metadata: Metadata = {
  title: "Projects — Pegah Construction Ltd.",
};

export default async function ProjectsPage() {
  const rows = await db.project.findMany({
    select: {
      id: true,
      name: true,
      location: true,
      category: true,
      type: true,
      dateCompleted: true,
      photos: {
        orderBy: { order: "asc" },
        select: { path: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const projects: PublicProject[] = rows.map((p) => ({
    id: p.id,
    name: p.name,
    location: p.location,
    category: p.category,
    type: p.type,
    dateCompleted: p.dateCompleted,
    photos: p.photos.map((ph) => ph.path),
  }));

  return (
    <PageShell
      eyebrow="Our work"
      title="Projects"
      intro="A selection of work delivered across Southern Ontario. Filter by category to explore."
    >
      <ProjectFilter projects={projects} />
    </PageShell>
  );
}
