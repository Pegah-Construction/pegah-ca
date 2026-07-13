import { db } from "@/lib/db";

// GET — list bids for a tender (with subcontractor info), lowest amount first.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rows = await db.bid.findMany({
    where: { tenderId: id },
    orderBy: { amount: "asc" },
    include: { subcontractor: true },
  });
  return Response.json(
    rows.map((r) => ({
      id: r.id,
      subcontractorId: r.subcontractorId,
      companyName: r.subcontractor.companyName,
      division: r.division,
      amount: r.amount,
      note: r.note,
      status: r.status,
      createdAt: r.createdAt,
    }))
  );
}

// POST — record a bid. Body: { subcontractorId, division?, amount, note? }.
// Marks the matching invitation (if any) as Submitted.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const subcontractorId = String(body.subcontractorId ?? "");
  const amount = Number(body.amount);

  if (!subcontractorId) return Response.json({ error: "subcontractorId is required." }, { status: 400 });
  if (!Number.isFinite(amount) || amount < 0) return Response.json({ error: "A valid amount is required." }, { status: 400 });

  const tender = await db.tender.findUnique({ where: { id } });
  if (!tender) return Response.json({ error: "Tender not found." }, { status: 404 });

  const bid = await db.bid.create({
    data: {
      id: `bid_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
      tenderId: id,
      subcontractorId,
      division: String(body.division ?? "").trim(),
      amount,
      note: String(body.note ?? "").trim(),
    },
    include: { subcontractor: true },
  });

  // If this sub was invited, reflect that they've now submitted.
  await db.bidInvitation.updateMany({
    where: { tenderId: id, subcontractorId, status: { not: "Submitted" } },
    data: { status: "Submitted" },
  });

  return Response.json(
    {
      id: bid.id,
      subcontractorId: bid.subcontractorId,
      companyName: bid.subcontractor.companyName,
      division: bid.division,
      amount: bid.amount,
      note: bid.note,
      status: bid.status,
      createdAt: bid.createdAt,
    },
    { status: 201 }
  );
}
