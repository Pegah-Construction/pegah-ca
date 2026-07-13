import { db } from "@/lib/db";

// PATCH — update an invitation's status. Body: { status }.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; invId: string }> }) {
  const { invId } = await params;
  const { status } = await req.json().catch(() => ({}));
  const allowed = ["Invited", "Viewed", "Submitted", "Declined"];
  if (!allowed.includes(status)) {
    return Response.json({ error: "Invalid status." }, { status: 400 });
  }
  await db.bidInvitation.update({ where: { id: invId }, data: { status } });
  return Response.json({ ok: true });
}

// DELETE — remove an invitation.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; invId: string }> }) {
  const { invId } = await params;
  await db.bidInvitation.delete({ where: { id: invId } });
  return new Response(null, { status: 204 });
}
