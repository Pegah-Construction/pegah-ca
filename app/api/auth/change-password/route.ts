import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";

export async function POST(req: Request) {
  const { userId, newPassword } = await req.json().catch(() => ({}));

  if (!userId || typeof newPassword !== "string") {
    return Response.json({ error: "Missing required fields." }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return Response.json({ error: "New password must be at least 8 characters." }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { id: String(userId) } });
  if (!user) {
    return Response.json({ error: "Account not found." }, { status: 404 });
  }

  await db.user.update({ where: { id: user.id }, data: { password: hashPassword(newPassword) } });
  return Response.json({ ok: true });
}
