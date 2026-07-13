import { db } from "@/lib/db";

// GET — list invitations for a tender, with subcontractor info.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rows = await db.bidInvitation.findMany({
    where: { tenderId: id },
    orderBy: { createdAt: "asc" },
    include: { subcontractor: true },
  });
  return Response.json(
    rows.map((r) => ({
      id: r.id,
      status: r.status,
      createdAt: r.createdAt,
      subcontractorId: r.subcontractorId,
      companyName: r.subcontractor.companyName,
      email: r.subcontractor.email,
      city: r.subcontractor.city,
      province: r.subcontractor.province,
      trades: JSON.parse(r.subcontractor.trades),
    }))
  );
}

// POST — invite one or more subcontractors. Body: { subcontractorIds: string[] }.
// Skips any already invited (unique per tender+sub).
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { subcontractorIds } = await req.json().catch(() => ({}));
  if (!Array.isArray(subcontractorIds) || subcontractorIds.length === 0) {
    return Response.json({ error: "subcontractorIds is required." }, { status: 400 });
  }

  const tender = await db.tender.findUnique({ where: { id } });
  if (!tender) return Response.json({ error: "Tender not found." }, { status: 404 });

  const existing = await db.bidInvitation.findMany({
    where: { tenderId: id, subcontractorId: { in: subcontractorIds } },
    select: { subcontractorId: true },
  });
  const already = new Set(existing.map((e) => e.subcontractorId));
  const toCreate = subcontractorIds.filter((sid: string) => !already.has(sid));

  if (toCreate.length > 0) {
    await db.bidInvitation.createMany({
      data: toCreate.map((sid: string) => ({
        id: `inv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
        tenderId: id,
        subcontractorId: sid,
      })),
    });
  }

  return Response.json({ invited: toCreate.length, skipped: already.size }, { status: 201 });
}
