import { db } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { read } = await req.json();
  const updated = await db.contactInquiry.update({ where: { id }, data: { read: Boolean(read) } });
  return Response.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.contactInquiry.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
