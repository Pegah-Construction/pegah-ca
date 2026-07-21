import { db } from "@/lib/db";
import { mapTender } from "@/lib/api-helpers";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await db.tender.findUnique({ where: { id } });
  if (!t) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(mapTender(t));
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.tender.delete({ where: { id } });
  return new Response(null, { status: 204 });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  const text = ["title","ref","org","platform","type","category","province","city","published","closing","status","note","desc","address","postalCode","bidUrl","contactName","contactEmail","contactPhone","contactFax"] as const;
  for (const key of text) if (key in body) data[key] = body[key];
  if ("value" in body) data.value = parseFloat(body.value);
  if ("tracked" in body) data.tracked = body.tracked;
  if ("codes" in body) data.codes = JSON.stringify(Array.isArray(body.codes) ? body.codes : []);
  const updated = await db.tender.update({ where: { id }, data });
  return Response.json(mapTender(updated));
}
