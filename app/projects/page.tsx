import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import ProjectFilter from "@/components/ProjectFilter";

export const metadata: Metadata = {
  title: "Projects — Pegah Construction Ltd.",
};

export default function ProjectsPage() {
  return (
    <PageShell
      eyebrow="Our work"
      title="Projects"
      intro="A selection of work delivered across Southern Ontario. Filter by sector to explore."
    >
      <ProjectFilter />
    </PageShell>
  );
}
