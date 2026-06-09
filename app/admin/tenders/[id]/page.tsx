import Guard from "@/components/admin/Guard";
import TenderDetailView from "@/components/admin/views/TenderDetailView";

export default function AdminTenderDetail({ params }: { params: { id: string } }) {
  return (
    <Guard module="tenders" title="Tender">
      <TenderDetailView id={params.id} />
    </Guard>
  );
}
