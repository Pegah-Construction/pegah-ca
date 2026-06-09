import { db } from "@/lib/db";
import { visibleProjectIds, mapProject } from "@/lib/api-helpers";

export async function POST(req: Request) {
  const body = await req.json();
  const id = `p_${Date.now().toString(36)}`;
  const project = await db.project.create({
    data: {
      id, name: body.name, clientId: body.clientId, sector: body.sector,
      status: body.status || "Planning", progress: 0,
      budget: parseFloat(body.budget) || 0, spent: 0,
      start: body.start, end: body.end,
      pmId: body.pmId, foremanId: body.foremanId, location: body.location,
    },
    include: { milestones: { orderBy: { id: "asc" } }, team: true },
  });
  return Response.json(mapProject(project), { status: 201 });
}

export async function GET(req: Request) {
  const userId = new URL(req.url).searchParams.get("userId");
  if (!userId) return Response.json({ error: "Missing userId" }, { status: 400 });
  const ids = await visibleProjectIds(userId);
  const projects = await db.project.findMany({
    where: { id: { in: ids } },
    include: { milestones: { orderBy: { id: "asc" } }, team: true },
    orderBy: { name: "asc" },
  });
  return Response.json(projects.map(mapProject));
}
