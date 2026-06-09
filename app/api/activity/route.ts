import { db } from "@/lib/db";
import { visibleProjectIds } from "@/lib/api-helpers";

export async function GET(req: Request) {
  const userId = new URL(req.url).searchParams.get("userId");
  if (!userId) return Response.json({ error: "Missing userId" }, { status: 400 });
  const ids = await visibleProjectIds(userId);
  const feed = await db.activity.findMany({
    where: { OR: [{ projectId: null }, { projectId: { in: ids } }] },
    orderBy: { id: "desc" },
    take: 10,
  });
  return Response.json(
    feed.map((a: { who: string; what: string; projectId: string | null; when: string }) => ({
      who: a.who, what: a.what, project: a.projectId, when: a.when,
    }))
  );
}
