import { db } from "@/lib/db";
import { createResetToken } from "@/lib/password";
import { sendEmail, passwordResetEmail } from "@/lib/email";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function baseUrl(req: Request): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  const origin = req.headers.get("origin");
  if (origin) return origin;
  const host = req.headers.get("host") ?? "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({}));
  const normalized = String(email ?? "").trim().toLowerCase();

  // Always respond 200 with the same message — never reveal whether an
  // account exists for the given email.
  const ok = Response.json({ ok: true });

  if (!normalized) return ok;

  const user = await db.user.findFirst({
    where: { email: { equals: normalized, mode: "insensitive" } },
  });
  if (!user || user.status !== "Active") return ok;

  // Invalidate any outstanding tokens for this user, then issue a fresh one.
  await db.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });

  const { token, tokenHash } = createResetToken();
  await db.passwordResetToken.create({
    data: {
      id: `prt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  const link = `${baseUrl(req)}/admin/reset-password?token=${token}`;
  try {
    const { subject, html, text } = passwordResetEmail(user.name, link);
    await sendEmail({ to: user.email, subject, html, text });
  } catch (err) {
    // Don't leak send failures to the client; log for the operator.
    console.error("Failed to send password reset email:", err);
  }

  return ok;
}
