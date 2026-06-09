import Guard from "@/components/admin/Guard";
import BoardView from "@/components/admin/views/BoardView";

export default function AdminBoard() {
  return (
    <Guard module="board" title="Task Board" sub="Drag cards between columns">
      <BoardView />
    </Guard>
  );
}
