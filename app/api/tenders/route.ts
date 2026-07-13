import { db } from "@/lib/db";
import { mapTender } from "@/lib/api-helpers";

export async function GET() {
  const tenders = await db.tender.findMany({ orderBy: { closing: "asc" } });
  return Response.json(tenders.map(mapTender));
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (!body.title?.trim()) {
    return Response.json({ error: "Title is required." }, { status: 400 });
  }
  const tender = await db.tender.create({
    data: {
      id: `t_${Date.now().toString(36)}`,
      title: body.title.trim(),
      ref: body.ref?.trim() ?? "",
      org: body.org?.trim() ?? "",
      platform: body.platform?.trim() || "Internal",
      type: body.type?.trim() || "RFQ",
      category: body.category?.trim() || "Commercial",
      value: parseFloat(body.value) || 0,
      province: body.province?.trim() ?? "",
      city: body.city?.trim() ?? "",
      published: body.published?.trim() ?? "",
      closing: body.closing?.trim() ?? "",
      status: body.status?.trim() || "Open",
      tracked: false,
      address: body.address?.trim() ?? "",
      postalCode: body.postalCode?.trim() ?? "",
      contactName: body.contactName?.trim() ?? "",
      contactEmail: body.contactEmail?.trim() ?? "",
      contactPhone: body.contactPhone?.trim() ?? "",
      contactFax: body.contactFax?.trim() ?? "",
      codes: JSON.stringify(Array.isArray(body.codes) ? body.codes : []),
      note: body.note?.trim() ?? "",
      desc: body.desc?.trim() ?? "",
    },
  });
  return Response.json(mapTender(tender), { status: 201 });
}
