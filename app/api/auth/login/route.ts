import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";

const VALID_ROLES = ["admin", "pm", "foreman"];

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return Response.json({ error: "Email and password are required." }, { status: 400 });
  }

  const user = await db.user.findFirst({
    where: { email: { equals: email.trim(), mode: "insensitive" } },
  });
  if (!user) {
    return Response.json({ error: "Invalid email or password." }, { status: 401 });
  }

  if (user.status !== "Active") {
    return Response.json({ error: "This account is inactive. Contact an administrator." }, { status: 403 });
  }

  if (!VALID_ROLES.includes(user.role)) {
    return Response.json({ error: "Account has an invalid role. Contact an administrator." }, { status: 403 });
  }

  // Allow login when no password is set yet (seed/legacy accounts)
  const ok = user.password === "" || verifyPassword(password, user.password);
  if (!ok) {
    return Response.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const { password: _hash, ...rest } = user;
  return Response.json(rest);
}
