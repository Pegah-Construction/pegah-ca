import { db } from "@/lib/db";
import { generatePassword, hashPassword } from "@/lib/password";

export async function POST(req: Request) {
  const body = await req.json();
  const id = `u_${Date.now().toString(36)}`;
  const password = (body.password as string | undefined)?.trim() || generatePassword(body.name, body.email);
  const user = await db.user.create({
    data: {
      // Administrator is the only role — set here rather than taken from the
      // request, so a crafted payload can't create an account in some other one.
      id, name: body.name, email: body.email, role: "admin",
      title: body.title, phone: body.phone || "",
      status: "Active", since: new Date().getFullYear().toString(),
      password: hashPassword(password),
    },
  });
  const { password: _hash, ...rest } = user;
  return Response.json({ ...rest, password }, { status: 201 });
}

export async function GET() {
  const users = await db.user.findMany({ orderBy: { name: "asc" } });
  return Response.json(users.map(({ password, ...u }) => u));
}
