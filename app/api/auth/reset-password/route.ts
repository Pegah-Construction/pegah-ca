import { db } from "@/lib/db";
import { hashToken, hashPassword } from "@/lib/password";

function validatePassword(pw: unknown): string | null {
  if (typeof pw !== "string" || pw.length < 8) {
    return "Password must be at least 8 characters.";
  }
  return null;
}

export async function POST(req: Request) {
  const { token, password } = await req.json().catch(() => ({}));

  if (!token || typeof token !== "string") {
    return Response.json({ error: "Invalid or missing reset token." }, { status: 400 });
  }
  const pwError = validatePassword(password);
  if (pwError) return Response.json({ error: pwError }, { status: 400 });

  const record = await db.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return Response.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
  }

  await db.$transaction([
    db.user.update({ where: { id: record.userId }, data: { password: hashPassword(password) } }),
    db.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    // Clean up any other outstanding tokens for this user.
    db.passwordResetToken.deleteMany({ where: { userId: record.userId, usedAt: null } }),
  ]);

  return Response.json({ ok: true });
}
