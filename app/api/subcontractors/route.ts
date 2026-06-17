import { db } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();
  const required = ["companyName", "phone", "city", "province", "postalCode", "firstName", "lastName", "email"];
  for (const f of required) {
    if (!body[f]?.trim()) return Response.json({ error: `${f} is required` }, { status: 400 });
  }

  const existing = await db.subcontractor.findFirst({ where: { email: body.email.trim().toLowerCase() } });
  if (existing) return Response.json({ error: "A registration with this email already exists." }, { status: 409 });

  const id = `sc_${Date.now().toString(36)}`;
  const sub = await db.subcontractor.create({
    data: {
      id,
      companyName: body.companyName.trim(),
      phone: body.phone.trim(),
      fax: body.fax?.trim() ?? "",
      website: body.website?.trim() ?? "",
      address: body.address?.trim() ?? "",
      city: body.city.trim(),
      province: body.province.trim(),
      postalCode: body.postalCode.trim(),
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      title: body.title?.trim() ?? "",
      email: body.email.trim().toLowerCase(),
      contactPhone: body.contactPhone?.trim() ?? "",
      mobile: body.mobile?.trim() ?? "",
      trades: JSON.stringify(body.trades ?? []),
      isCOR: !!body.isCOR,
      isWSIB: !!body.isWSIB,
      isBonded: !!body.isBonded,
      isInsured: !!body.isInsured,
      notes: body.notes?.trim() ?? "",
    },
  });
  return Response.json({ id: sub.id }, { status: 201 });
}

export async function GET() {
  const rows = await db.subcontractor.findMany({ orderBy: { createdAt: "desc" } });
  return Response.json(rows.map((s) => ({ ...s, trades: JSON.parse(s.trades) })));
}
