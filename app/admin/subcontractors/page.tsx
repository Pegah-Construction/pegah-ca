import Guard from "@/components/admin/Guard";
import SubcontractorsView from "@/components/admin/views/SubcontractorsView";

export default function AdminSubcontractors() {
  return (
    <Guard module="subcontractors" title="Subcontractors" sub="Registered subcontractor directory">
      <SubcontractorsView />
    </Guard>
  );
}
