import { db } from "@/lib/db";

// Likes are anonymous: the site has no public accounts, so a reader is
// identified only by a random id their browser generated and stored locally.
// It is never linked to a person — it exists purely to stop one browser
// counting twice and to let it undo its own like.

type Ctx = { params: Promise<{ id: string }> };

// A malformed or absurdly long id would only ever be self-inflicted, but it is
// user input reaching the database, so keep it to something id-shaped.
const cleanVisitor = (v: unknown) =>
  typeof v === "string" && v.length > 0 && v.length <= 64 ? v : null;

// Current count, plus whether the asking browser is among them.
export async function GET(req: Request, { params }: Ctx) {
  const { id } = await params;
  const visitorId = cleanVisitor(new URL(req.url).searchParams.get("visitorId"));

  const [count, mine] = await Promise.all([
    db.articleLike.count({ where: { articleId: id } }),
    visitorId
      ? db.articleLike.findUnique({ where: { articleId_visitorId: { articleId: id, visitorId } } })
      : Promise.resolve(null),
  ]);

  return Response.json({ count, liked: Boolean(mine) });
}

export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const visitorId = cleanVisitor(body.visitorId);
  if (!visitorId) return Response.json({ error: "visitorId required" }, { status: 400 });

  const article = await db.article.findUnique({ where: { id }, select: { status: true } });
  // Only published posts can be liked — a draft's URL shouldn't accumulate them.
  if (!article || article.status !== "Published") {
    return Response.json({ error: "Article not found" }, { status: 404 });
  }

  // Idempotent: liking twice from the same browser is a no-op rather than an
  // error, so a double-tap or a retried request can't inflate the count.
  await db.articleLike.upsert({
    where: { articleId_visitorId: { articleId: id, visitorId } },
    update: {},
    create: { id: `al_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`, articleId: id, visitorId },
  });

  const count = await db.articleLike.count({ where: { articleId: id } });
  return Response.json({ count, liked: true });
}

export async function DELETE(req: Request, { params }: Ctx) {
  const { id } = await params;
  const visitorId = cleanVisitor(new URL(req.url).searchParams.get("visitorId"));
  if (!visitorId) return Response.json({ error: "visitorId required" }, { status: 400 });

  // deleteMany rather than delete: removing a like that isn't there should
  // succeed quietly instead of throwing.
  await db.articleLike.deleteMany({ where: { articleId: id, visitorId } });

  const count = await db.articleLike.count({ where: { articleId: id } });
  return Response.json({ count, liked: false });
}
