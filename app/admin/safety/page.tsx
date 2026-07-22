import Guard from "@/components/admin/Guard";
import SafetyContentView from "@/components/admin/views/SafetyContentView";

export default function AdminSafety() {
  return (
    <Guard module="safety" title="Health & Safety" sub="Edit the public Health & Safety page">
      <SafetyContentView />
    </Guard>
  );
}
