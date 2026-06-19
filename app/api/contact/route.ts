import { db } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, company, message } = body;
  if (!name || !email || !message) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }
  const inquiry = await db.contactInquiry.create({
    data: {
      id: `ci_${Date.now().toString(36)}`,
      name: String(name).slice(0, 200),
      email: String(email).slice(0, 200),
      company: String(company ?? "").slice(0, 200),
      message: String(message).slice(0, 5000),
    },
  });
  return Response.json({ id: inquiry.id }, { status: 201 });
}

export async function GET() {
  const rows = await db.contactInquiry.findMany({ orderBy: { createdAt: "desc" } });
  return Response.json(rows);
}
