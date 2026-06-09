import Guard from "@/components/admin/Guard";
import DashboardView from "@/components/admin/views/DashboardView";

export default function AdminHome() {
  return (
    <Guard module="dashboard" title="Dashboard" sub="Overview of your projects">
      <DashboardView />
    </Guard>
  );
}
