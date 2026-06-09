import { db } from "@/lib/db";
import { visibleProjectIds, mapCard } from "@/lib/api-helpers";

export async function GET(req: Request) {
  const userId = new URL(req.url).searchParams.get("userId");
  if (!userId) return Response.json({ error: "Missing userId" }, { status: 400 });
  const ids = await visibleProjectIds(userId);
  const cards = await db.card.findMany({
    where: { projectId: { in: ids } },
    include: {
      subtasks: { orderBy: { id: "asc" } },
      comments: { orderBy: { id: "asc" } },
    },
  });
  return Response.json(cards.map(mapCard));
}
