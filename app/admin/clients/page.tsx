import Guard from "@/components/admin/Guard";
import ClientsView from "@/components/admin/views/ClientsView";

export default function AdminClients() {
  return (
    <Guard module="clients" title="Clients">
      <ClientsView />
    </Guard>
  );
}
