import { db } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();
  const id = `u_${Date.now().toString(36)}`;
  const user = await db.user.create({
    data: {
      id, name: body.name, email: body.email, role: body.role,
      title: body.title, phone: body.phone || "",
      status: "Active", since: new Date().getFullYear().toString(),
    },
  });
  return Response.json(user, { status: 201 });
}

export async function GET() {
  const users = await db.user.findMany({ orderBy: { name: "asc" } });
  return Response.json(users);
}
