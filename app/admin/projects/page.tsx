import Guard from "@/components/admin/Guard";
import ProjectsView from "@/components/admin/views/ProjectsView";

export default function AdminProjects() {
  return (
    <Guard module="projects" title="Projects">
      <ProjectsView />
    </Guard>
  );
}
