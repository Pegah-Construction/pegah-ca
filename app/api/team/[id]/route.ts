import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.title !== undefined) data.title = body.title;
  if (body.bio !== undefined) data.bio = body.bio;
  if (body.order !== undefined) data.order = body.order;
  const member = await db.teamMember.update({ where: { id }, data });
  revalidatePath("/about");
  return Response.json(member);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.teamMember.delete({ where: { id } });
  revalidatePath("/about");
  return new Response(null, { status: 204 });
}
