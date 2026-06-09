import { db } from "@/lib/db";
import { mapCard } from "@/lib/api-helpers";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  if ("col" in body) {
    await db.card.update({ where: { id }, data: { col: body.col } });
  }

  if ("subtasks" in body && Array.isArray(body.subtasks)) {
    const existing = await db.cardSubtask.findMany({ where: { cardId: id }, orderBy: { id: "asc" } });
    for (let i = 0; i < existing.length && i < body.subtasks.length; i++) {
      await db.cardSubtask.update({ where: { id: existing[i].id }, data: { done: body.subtasks[i].done } });
    }
  }

  const updated = await db.card.findUnique({
    where: { id },
    include: { subtasks: { orderBy: { id: "asc" } }, comments: { orderBy: { id: "asc" } } },
  });
  if (!updated) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(mapCard(updated));
}
