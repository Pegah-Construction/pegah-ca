import { db } from "@/lib/db";

// PATCH — update a bid's status. Body: { status }.
// "Awarded" is exclusive: awarding one bid resets any other awarded bid on the
// same tender back to Shortlisted.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; bidId: string }> }) {
  const { id, bidId } = await params;
  const { status } = await req.json().catch(() => ({}));
  const allowed = ["Received", "Shortlisted", "Awarded", "Rejected"];
  if (!allowed.includes(status)) {
    return Response.json({ error: "Invalid status." }, { status: 400 });
  }

  if (status === "Awarded") {
    await db.bid.updateMany({
      where: { tenderId: id, status: "Awarded", id: { not: bidId } },
      data: { status: "Shortlisted" },
    });
  }

  const updated = await db.bid.update({ where: { id: bidId }, data: { status } });
  return Response.json({ id: updated.id, status: updated.status });
}

// DELETE — remove a bid.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; bidId: string }> }) {
  const { bidId } = await params;
  await db.bid.delete({ where: { id: bidId } });
  return new Response(null, { status: 204 });
}
