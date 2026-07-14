import { db } from "@/lib/db";
import { unlink } from "fs/promises";
import { join } from "path";
import { visibleProjectIds, mapProject } from "@/lib/api-helpers";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = new URL(req.url).searchParams.get("userId");
  if (!userId) return Response.json({ error: "Missing userId" }, { status: 400 });
  const ids = await visibleProjectIds(userId);
  if (!ids.includes(id)) return Response.json({ error: "Not found" }, { status: 404 });
  const p = await db.project.findUnique({
    where: { id },
    include: {
      milestones: { orderBy: { id: "asc" } },
      team: true,
      photos: { orderBy: { order: "asc" } },
    },
  });
  if (!p) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(mapProject(p));
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const photos = await db.projectPhoto.findMany({ where: { projectId: id } });
  await Promise.allSettled(
    photos.map((ph) => unlink(join(process.cwd(), "public", ph.path)).catch(() => {}))
  );
  await db.$transaction([
    db.cardSubtask.deleteMany({ where: { card: { projectId: id } } }),
    db.cardComment.deleteMany({ where: { card: { projectId: id } } }),
    db.card.deleteMany({ where: { projectId: id } }),
    db.milestone.deleteMany({ where: { projectId: id } }),
    db.task.deleteMany({ where: { projectId: id } }),
    db.incident.deleteMany({ where: { projectId: id } }),
    db.projectTeam.deleteMany({ where: { projectId: id } }),
    db.activity.deleteMany({ where: { projectId: id } }),
    db.doc.updateMany({ where: { projectId: id }, data: { projectId: null } }),
    db.article.updateMany({ where: { projectId: id }, data: { projectId: null } }),
    db.project.delete({ where: { id } }),
  ]);
  return new Response(null, { status: 204 });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const allowed = [
    "name", "location", "category", "type", "constructionType", "dateCompleted", "owner", "architect",
    "contractType", "value", "grossFloorArea", "description",
  ] as const;
  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (!(key in body)) continue;
    data[key] = key === "value" ? parseFloat(body[key]) || 0 : body[key];
  }
  const updated = await db.project.update({
    where: { id },
    data,
    include: {
      milestones: { orderBy: { id: "asc" } },
      team: true,
      photos: { orderBy: { order: "asc" } },
    },
  });
  return Response.json(mapProject(updated));
}
