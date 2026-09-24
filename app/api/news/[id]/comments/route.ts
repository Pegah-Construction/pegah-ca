import { db } from "@/lib/db";
import {
  COMMENT_COOLDOWN_MS,
  COMMENT_HONEYPOT_FIELD,
  validateComment,
} from "@/lib/comments";

type Ctx = { params: Promise<{ id: string }> };

// Public list. Email is deliberately absent from the selection — it's collected
// for follow-up, never shown on the site.
//
// Hidden comments are left out, so a comment taken down stops appearing on the
// article. `?all=1` is what the dashboard's moderation panel asks for: it wants
// the hidden ones too, to show them struck through with a way to put them back.
export async function GET(req: Request, { params }: Ctx) {
  const { id } = await params;
  const all = new URL(req.url).searchParams.get("all") === "1";
  const comments = await db.articleComment.findMany({
    where: { articleId: id, ...(all ? {} : { hidden: false }) },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, body: true, createdAt: true, ...(all ? { hidden: true } : {}) },
  });
  return Response.json(comments);
}

export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const payload = await req.json().catch(() => ({}));

  // Honeypot: a hidden field no person ever sees. If it's filled, a bot did it.
  // Answer 200 anyway — telling a spammer why it failed just helps it adapt.
  if (typeof payload[COMMENT_HONEYPOT_FIELD] === "string" && payload[COMMENT_HONEYPOT_FIELD].trim() !== "") {
    return Response.json({ ok: true });
  }

  const result = validateComment(payload);
  if (!result.ok) return Response.json({ error: result.error }, { status: 400 });

  const article = await db.article.findUnique({
    where: { id },
    select: { status: true, commentsEnabled: true },
  });
  // Drafts aren't public, so they can't collect comments either.
  if (!article || article.status !== "Published") {
    return Response.json({ error: "Article not found" }, { status: 404 });
  }
  // Closed from the dashboard. Checked here as well as hidden in the form, so
  // turning comments off actually stops new ones rather than just removing the
  // box from the page.
  if (!article.commentsEnabled) {
    return Response.json({ error: "Comments are closed on this article." }, { status: 403 });
  }

  const visitorId = typeof payload.visitorId === "string" ? payload.visitorId.slice(0, 64) : "";

  // Cooldown, so one browser can't post repeatedly in a burst.
  if (visitorId) {
    const last = await db.articleComment.findFirst({
      where: { visitorId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });
    if (last && Date.now() - last.createdAt.getTime() < COMMENT_COOLDOWN_MS) {
      const wait = Math.ceil((COMMENT_COOLDOWN_MS - (Date.now() - last.createdAt.getTime())) / 1000);
      return Response.json(
        { error: `You just posted a comment — please wait ${wait}s before posting another.` },
        { status: 429 }
      );
    }
  }

  const created = await db.articleComment.create({
    data: {
      id: `ac_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      articleId: id,
      name: result.name,
      email: result.email,
      body: result.body,
      visitorId,
    },
    select: { id: true, name: true, body: true, createdAt: true },
  });

  return Response.json(created, { status: 201 });
}
