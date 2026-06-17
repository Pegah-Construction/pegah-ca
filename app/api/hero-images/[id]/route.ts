import { db } from "@/lib/db";
import { deleteFile } from "@/lib/storage";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const image = await db.heroImage.findUnique({ where: { id: Number(id) } });
  if (!image) return Response.json({ error: "Not found" }, { status: 404 });

  await deleteFile(image.path);
  await db.heroImage.delete({ where: { id: Number(id) } });
  return new Response(null, { status: 204 });
}
