import { db } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const allowed = ["type", "severity", "status", "note", "date"] as const;
  const data: Record<string, unknown> = {};
  for (const key of allowed) if (key in body) data[key] = body[key];
  const updated = await db.incident.update({ where: { id }, data });
  return Response.json({
    id: updated.id, project: updated.projectId, date: updated.date,
    type: updated.type, severity: updated.severity, status: updated.status,
    reportedBy: updated.reportedById, note: updated.note,
  });
}
