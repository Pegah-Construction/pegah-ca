import Guard from "@/components/admin/Guard";
import ProjectDetailView from "@/components/admin/views/ProjectDetailView";

export default function AdminProjectDetail({ params }: { params: { id: string } }) {
  return (
    <Guard module="projects" title="Project">
      <ProjectDetailView id={params.id} />
    </Guard>
  );
}
