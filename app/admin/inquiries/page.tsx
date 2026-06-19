import Guard from "@/components/admin/Guard";
import InquiriesView from "@/components/admin/views/InquiriesView";

export default function AdminInquiries() {
  return (
    <Guard module="inquiries" title="Inquiries" sub="Contact form submissions from the website">
      <InquiriesView />
    </Guard>
  );
}
