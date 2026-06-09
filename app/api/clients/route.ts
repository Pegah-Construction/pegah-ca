import { db } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();
  const id = `c_${Date.now().toString(36)}`;
  const client = await db.client.create({
    data: {
      id, name: body.name, sector: body.sector,
      contact: body.contact, email: body.email, phone: body.phone,
      since: new Date().getFullYear().toString(),
    },
  });
  return Response.json(client, { status: 201 });
}

export async function GET() {
  const clients = await db.client.findMany({ orderBy: { name: "asc" } });
  return Response.json(clients);
}
