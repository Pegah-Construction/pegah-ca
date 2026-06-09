import Guard from "@/components/admin/Guard";
import SafetyView from "@/components/admin/views/SafetyView";

export default function AdminSafety() {
  return (
    <Guard module="safety" title="Safety" sub="Incidents & reporting">
      <SafetyView />
    </Guard>
  );
}
