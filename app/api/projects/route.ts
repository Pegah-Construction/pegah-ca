import { db } from "@/lib/db";
import { visibleProjectIds, mapProject } from "@/lib/api-helpers";

export async function POST(req: Request) {
  const body = await req.json();
  const id = `p_${Date.now().toString(36)}`;
  const project = await db.project.create({
    data: {
      id,
      name: body.name,
      location: body.location || "",
      category: body.category || "",
      type: body.type || "",
      dateCompleted: body.dateCompleted || "",
      owner: body.owner || "",
      architect: body.architect || "",
      contractType: body.contractType || "",
      value: parseFloat(body.value) || 0,
      grossFloorArea: body.grossFloorArea || "",
      description: body.description || "",
    },
    include: {
      milestones: { orderBy: { id: "asc" } },
      team: true,
      photos: { orderBy: { order: "asc" } },
    },
  });
  return Response.json(mapProject(project), { status: 201 });
}

export async function GET(req: Request) {
  const userId = new URL(req.url).searchParams.get("userId");
  if (!userId) return Response.json({ error: "Missing userId" }, { status: 400 });
  const ids = await visibleProjectIds(userId);
  const projects = await db.project.findMany({
    where: { id: { in: ids } },
    include: {
      milestones: { orderBy: { id: "asc" } },
      team: true,
      photos: { orderBy: { order: "asc" } },
    },
    orderBy: { name: "asc" },
  });
  return Response.json(projects.map(mapProject));
}
