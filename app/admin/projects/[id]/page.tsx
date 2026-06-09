import Guard from "@/components/admin/Guard";
import ProjectDetailView from "@/components/admin/views/ProjectDetailView";

export default async function AdminProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Guard module="projects" title="Project">
      <ProjectDetailView id={id} />
    </Guard>
  );
}
