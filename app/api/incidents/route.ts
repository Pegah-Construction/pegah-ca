import { db } from "@/lib/db";
import { visibleProjectIds } from "@/lib/api-helpers";

export async function POST(req: Request) {
  const body = await req.json();
  const id = `s_${Date.now().toString(36)}`;
  const incident = await db.incident.create({
    data: {
      id, projectId: body.projectId, date: body.date,
      type: body.type, severity: body.severity, status: "Open",
      reportedById: body.reportedById, note: body.note,
    },
  });
  return Response.json({
    id: incident.id, project: incident.projectId, date: incident.date,
    type: incident.type, severity: incident.severity, status: incident.status,
    reportedBy: incident.reportedById, note: incident.note,
  }, { status: 201 });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const projectId = searchParams.get("projectId");
  if (!userId) return Response.json({ error: "Missing userId" }, { status: 400 });
  const ids = await visibleProjectIds(userId);
  const incidents = await db.incident.findMany({
    where: { projectId: projectId ? projectId : { in: ids } },
    orderBy: { date: "desc" },
  });
  return Response.json(
    incidents.map((s: { id: string; projectId: string; date: string; type: string; severity: string; status: string; reportedById: string; note: string }) => ({
      id: s.id, project: s.projectId, date: s.date, type: s.type,
      severity: s.severity, status: s.status, reportedBy: s.reportedById, note: s.note,
    }))
  );
}
