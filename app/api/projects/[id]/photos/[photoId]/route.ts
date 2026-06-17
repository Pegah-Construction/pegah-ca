import { db } from "@/lib/db";
import { deleteFile } from "@/lib/storage";
import { revalidatePath } from "next/cache";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; photoId: string }> }
) {
  const { id, photoId } = await params;
  const numId = parseInt(photoId, 10);
  const photo = await db.projectPhoto.findUnique({ where: { id: numId } });
  if (!photo) return Response.json({ error: "Not found" }, { status: 404 });
  await deleteFile(photo.path);
  await db.projectPhoto.delete({ where: { id: numId } });
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  return new Response(null, { status: 204 });
}
