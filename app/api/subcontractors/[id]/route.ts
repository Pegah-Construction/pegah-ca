import { db } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if ("status" in body) data.status = body.status;
  if ("notes" in body) data.notes = body.notes;
  const updated = await db.subcontractor.update({ where: { id }, data });
  return Response.json({ ...updated, trades: JSON.parse(updated.trades) });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.subcontractor.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
