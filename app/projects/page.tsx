import type { Metadata } from "next";
import { db } from "@/lib/db";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProjectFilter, { type PublicProject } from "@/components/ProjectFilter";
import { getStorageUrl } from "@/lib/storage-url";

export const dynamic = "force-dynamic";

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
    photos: p.photos.map((ph) => getStorageUrl(ph.path)),
  }));

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
