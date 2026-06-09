import Guard from "@/components/admin/Guard";
import SettingsView from "@/components/admin/views/SettingsView";

export default function AdminSettings() {
  return (
    <Guard module="settings" title="Settings">
      <SettingsView />
    </Guard>
  );
}
