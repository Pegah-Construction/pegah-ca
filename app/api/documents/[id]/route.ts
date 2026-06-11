import { db } from "@/lib/db";
import { unlink } from "fs/promises";
import { join } from "path";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = await db.doc.findUnique({ where: { id } });
  if (!doc) return Response.json({ error: "Not found" }, { status: 404 });
  await db.doc.delete({ where: { id } });
  if (doc.path) {
    await unlink(join(process.cwd(), "public", doc.path)).catch(() => {});
  }
  return new Response(null, { status: 204 });
}
