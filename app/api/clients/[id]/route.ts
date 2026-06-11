import { db } from "@/lib/db";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectCount = await db.project.count({ where: { clientId: id } });
  if (projectCount > 0) {
    return Response.json({ error: "Cannot delete a client with active projects." }, { status: 409 });
  }
  await db.client.delete({ where: { id } });
  return new Response(null, { status: 204 });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const allowed = ["name", "sector", "contact", "email", "phone"] as const;
  const data: Record<string, unknown> = {};
  for (const key of allowed) if (key in body) data[key] = body[key];
  const updated = await db.client.update({ where: { id }, data });
  return Response.json(updated);
}
