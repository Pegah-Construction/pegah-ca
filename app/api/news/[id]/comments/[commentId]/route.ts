import { db } from "@/lib/db";

type Ctx = { params: Promise<{ id: string; commentId: string }> };

/**
 * Hide or restore a comment from the dashboard. Comments publish immediately,
 * so this is the first line of moderation: hiding takes one off the article at
 * once while keeping it (and the commenter's email) on record, which is what
 * you want for anything that might need to be looked at again. DELETE below is
 * for the cases where the comment itself shouldn't survive.
 */
export async function PATCH(req: Request, { params }: Ctx) {
  const { id, commentId } = await params;
  const body = await req.json().catch(() => ({}));
  if (typeof body.hidden !== "boolean") {
    return Response.json({ error: "Expected { hidden: boolean }" }, { status: 400 });
  }

  // Scoped to the article in the URL, the same way DELETE is.
  const { count } = await db.articleComment.updateMany({
    where: { id: commentId, articleId: id },
    data: { hidden: body.hidden },
  });
  if (count === 0) return Response.json({ error: "Comment not found" }, { status: 404 });

  return Response.json({ id: commentId, hidden: body.hidden });
}

// Removing a comment for good. Unlike hiding, nothing about it is kept.
export async function DELETE(_req: Request, { params }: Ctx) {
  const { id, commentId } = await params;

  // Scoped to the article in the URL, so a mismatched pair deletes nothing
  // rather than removing a comment from somewhere else.
  const { count } = await db.articleComment.deleteMany({
    where: { id: commentId, articleId: id },
  });
  if (count === 0) return Response.json({ error: "Comment not found" }, { status: 404 });

  return new Response(null, { status: 204 });
}
