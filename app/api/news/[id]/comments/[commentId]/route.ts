import { db } from "@/lib/db";

// Removing a comment from the dashboard. Comments publish immediately, so this
// is the moderation mechanism.
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const { id, commentId } = await params;

  // Scoped to the article in the URL, so a mismatched pair deletes nothing
  // rather than removing a comment from somewhere else.
  const { count } = await db.articleComment.deleteMany({
    where: { id: commentId, articleId: id },
  });
  if (count === 0) return Response.json({ error: "Comment not found" }, { status: 404 });

  return new Response(null, { status: 204 });
}
