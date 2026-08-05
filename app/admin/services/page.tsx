import Guard from "@/components/admin/Guard";
import ServicesView from "@/components/admin/views/ServicesView";

export default function AdminServices() {
  return (
    <Guard module="services" title="Services" sub="Headings and the services list, shown on the services page and the home page">
      <ServicesView />
    </Guard>
  );
}
