import Guard from "@/components/admin/Guard";
import DocumentsView from "@/components/admin/views/DocumentsView";

export default function AdminDocuments() {
  return (
    <Guard module="documents" title="Documents">
      <DocumentsView />
    </Guard>
  );
}
