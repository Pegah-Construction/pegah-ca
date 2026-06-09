import Guard from "@/components/admin/Guard";
import AIView from "@/components/admin/views/AIView";

export default function AdminAI() {
  return (
    <Guard module="ai" title="AI Assistant" sub="Connected to your live data">
      <AIView />
    </Guard>
  );
}
