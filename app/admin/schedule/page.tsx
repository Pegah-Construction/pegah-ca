import Guard from "@/components/admin/Guard";
import ScheduleView from "@/components/admin/views/ScheduleView";

export default function AdminSchedule() {
  return (
    <Guard module="schedule" title="Schedule" sub="Milestones across projects">
      <ScheduleView />
    </Guard>
  );
}
