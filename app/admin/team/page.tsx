import Guard from "@/components/admin/Guard";
import TeamView from "@/components/admin/views/TeamView";

export default function AdminTeam() {
  return (
    <Guard module="team" title="About / Team" sub="Leadership profiles and team photo for the About page">
      <TeamView />
    </Guard>
  );
}
