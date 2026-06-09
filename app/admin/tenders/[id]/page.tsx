import Guard from "@/components/admin/Guard";
import TenderDetailView from "@/components/admin/views/TenderDetailView";

export default async function AdminTenderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Guard module="tenders" title="Tender">
      <TenderDetailView id={id} />
    </Guard>
  );
}
