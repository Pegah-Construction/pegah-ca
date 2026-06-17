import { db } from "@/lib/db";
import { visibleProjectIds } from "@/lib/api-helpers";

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString("en-CA");
}

export async function GET(req: Request) {
  const userId = new URL(req.url).searchParams.get("userId");
  if (!userId) return Response.json({ error: "Missing userId" }, { status: 400 });
  const ids = await visibleProjectIds(userId);
  const feed = await db.activity.findMany({
    where: { OR: [{ projectId: null }, { projectId: { in: ids } }] },
    include: { user: true, project: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  return Response.json(
    feed.map((a) => ({
      who: a.who,
      whoName: a.user.name,
      what: a.what,
      project: a.projectId,
      projectName: a.project?.name ?? null,
      when: timeAgo(a.createdAt),
    }))
  );
}
