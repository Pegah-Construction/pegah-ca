import { db } from "@/lib/db";
import { visibleProjectIds } from "@/lib/api-helpers";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const projectId = searchParams.get("projectId");
  if (!userId) return Response.json({ error: "Missing userId" }, { status: 400 });
  const ids = await visibleProjectIds(userId);
  const tasks = await db.task.findMany({
    where: { projectId: projectId ? projectId : { in: ids } },
    orderBy: { due: "asc" },
  });
  return Response.json(
    tasks.map((t) => ({
      id: t.id, title: t.title, project: t.projectId,
      assignee: t.assigneeId, due: t.due, status: t.status, priority: t.priority,
    }))
  );
}
