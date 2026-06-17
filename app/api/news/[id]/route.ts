import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.article.delete({ where: { id } });
  return new Response(null, { status: 204 });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if ("status" in body) data.status = body.status;
  if ("featured" in body) data.featured = body.featured;
  if ("body" in body) data.body = body.body;
  if ("title" in body) data.title = body.title;
  if ("authorId" in body) data.authorId = body.authorId;
  if ("excerpt" in body) data.excerpt = body.excerpt;
  if ("tags" in body) data.tags = JSON.stringify(body.tags);
  const updated = await db.article.update({ where: { id }, data });
  if ("status" in body && body.userId) {
    const verb = body.status === "Published" ? "published" : "unpublished";
    await logActivity(body.userId, `${verb} article "${updated.title}"`);
  }
  return Response.json({
    id: updated.id, title: updated.title, slug: updated.slug, project: updated.projectId,
    author: updated.authorId, status: updated.status, date: updated.date, tags: JSON.parse(updated.tags),
    featured: updated.featured, excerpt: updated.excerpt, body: updated.body,
    coverImage: updated.coverImage ?? "", words: updated.words,
  });
}
