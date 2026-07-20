import Guard from "@/components/admin/Guard";
import TendersView from "@/components/admin/views/TendersView";

export default function AdminTenders() {
  return (
    <Guard module="tenders" title="Tenders" sub="Bid opportunities synced from SmartBid">
      <TendersView />
    </Guard>
  );
}
