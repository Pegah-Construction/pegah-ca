import { db } from "@/lib/db";
import { unlink } from "fs/promises";
import { join } from "path";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const image = await db.heroImage.findUnique({ where: { id: Number(id) } });
  if (!image) return Response.json({ error: "Not found" }, { status: 404 });

  try {
    await unlink(join(process.cwd(), "public", image.path));
  } catch {
    // file already gone — proceed
  }

  await db.heroImage.delete({ where: { id: Number(id) } });
  return new Response(null, { status: 204 });
}
