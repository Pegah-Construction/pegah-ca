import Guard from "@/components/admin/Guard";
import UsersView from "@/components/admin/views/UsersView";

export default function AdminUsers() {
  return (
    <Guard module="users" title="Users & Roles" sub="Manage staff access">
      <UsersView />
    </Guard>
  );
}
