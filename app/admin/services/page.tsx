import Guard from "@/components/admin/Guard";
import ServicesView from "@/components/admin/views/ServicesView";

export default function AdminServices() {
  return (
    <Guard module="services" title="Services" sub="Headings, intro and the services list — the services section on the home page">
      <ServicesView />
    </Guard>
  );
}
