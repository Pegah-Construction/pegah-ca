import Guard from "@/components/admin/Guard";
import TendersView from "@/components/admin/views/TendersView";

export default function AdminTenders() {
  return (
    <Guard module="tenders" title="Tenders" sub="Aggregated procurement opportunities">
      <TendersView />
    </Guard>
  );
}
