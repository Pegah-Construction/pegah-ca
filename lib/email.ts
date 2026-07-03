// Minimal email sender. Uses the Resend REST API when RESEND_API_KEY is set;
// otherwise logs the message to the server console so flows are testable in
// local development without an email provider.
//
// Required env for real delivery:
//   RESEND_API_KEY   — your Resend API key
//   EMAIL_FROM       — verified sender, e.g. "Pegah Admin <no-reply@pegah.ca>"

type SendArgs = { to: string; subject: string; html: string; text?: string };

const FROM = process.env.EMAIL_FROM || "Pegah Admin <onboarding@resend.dev>";

export async function sendEmail({ to, subject, html, text }: SendArgs): Promise<void> {
  const key = process.env.RESEND_API_KEY;

  if (!key) {
    // Dev fallback — surface the content in the server logs.
    console.warn(
      `\n[email] RESEND_API_KEY not set — email not sent.\n  To: ${to}\n  Subject: ${subject}\n  ${text ?? html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}\n`
    );
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to, subject, html, text }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Email send failed (${res.status}): ${detail}`);
  }
}

export function passwordResetEmail(name: string, link: string): { subject: string; html: string; text: string } {
  const firstName = (name || "there").trim().split(/\s+/)[0];
  const subject = "Reset your Pegah Admin password";
  const text = `Hi ${firstName},\n\nWe received a request to reset your Pegah Admin password. Use the link below to choose a new one. This link expires in 1 hour.\n\n${link}\n\nIf you didn't request this, you can safely ignore this email.`;
  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#1b1e24">
    <div style="font-weight:800;font-size:18px;letter-spacing:-0.02em;color:#0f1f4d;margin-bottom:24px">PEGAH <span style="color:#3a5abf">Admin</span></div>
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px">Hi ${firstName},</p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 24px">We received a request to reset your Pegah Admin password. Click the button below to choose a new one. This link expires in <strong>1 hour</strong>.</p>
    <a href="${link}" style="display:inline-block;background:#1f3a93;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:8px">Reset password</a>
    <p style="font-size:13px;line-height:1.6;color:#6f6a61;margin:24px 0 0">If the button doesn't work, copy and paste this link:<br><a href="${link}" style="color:#1f3a93;word-break:break-all">${link}</a></p>
    <p style="font-size:13px;line-height:1.6;color:#6f6a61;margin:24px 0 0">If you didn't request this, you can safely ignore this email — your password won't change.</p>
  </div>`;
  return { subject, html, text };
}
