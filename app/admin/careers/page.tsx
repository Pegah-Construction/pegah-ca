import Guard from "@/components/admin/Guard";
import CareersView from "@/components/admin/views/CareersView";

export default function AdminCareers() {
  return (
    <Guard module="careers" title="Careers" sub="Job postings published to the public site">
      <CareersView />
    </Guard>
  );
}
