import { db } from "@/lib/db";
import { del } from "@vercel/blob";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; photoId: string }> }
) {
  const { photoId } = await params;
  const numId = parseInt(photoId, 10);
  const photo = await db.projectPhoto.findUnique({ where: { id: numId } });
  if (!photo) return Response.json({ error: "Not found" }, { status: 404 });

  await del(photo.path).catch(() => {});
  await db.projectPhoto.delete({ where: { id: numId } });
  return new Response(null, { status: 204 });
}
