import { db } from "@/lib/db";
import { visibleProjectIds, mapProject } from "@/lib/api-helpers";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = new URL(req.url).searchParams.get("userId");
  if (!userId) return Response.json({ error: "Missing userId" }, { status: 400 });
  const ids = await visibleProjectIds(userId);
  if (!ids.includes(id)) return Response.json({ error: "Not found" }, { status: 404 });
  const p = await db.project.findUnique({
    where: { id },
    include: { milestones: { orderBy: { id: "asc" } }, team: true },
  });
  if (!p) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(mapProject(p));
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const allowed = ["name","clientId","sector","status","progress","budget","spent","start","end","pmId","foremanId","location"] as const;
  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (!(key in body)) continue;
    data[key] = (key === "budget" || key === "spent") ? parseFloat(body[key]) : body[key];
  }
  const updated = await db.project.update({ where: { id }, data });
  return Response.json({
    id: updated.id, name: updated.name, client: updated.clientId,
    sector: updated.sector, status: updated.status, progress: updated.progress,
    budget: updated.budget, spent: updated.spent, start: updated.start, end: updated.end,
    pm: updated.pmId, foreman: updated.foremanId, location: updated.location,
  });
}
