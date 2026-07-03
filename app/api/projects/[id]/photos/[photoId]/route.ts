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
  // Remove the storage file best-effort — a failure here (e.g. missing
  // storage config, orphaned path) must NOT prevent the DB record from
  // being deleted, otherwise the photo reappears on reload.
  try {
    await deleteFile(photo.path);
  } catch (err) {
    console.error(`Failed to delete storage file for photo ${numId}:`, err);
  }
  await db.projectPhoto.delete({ where: { id: numId } });
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  return new Response(null, { status: 204 });
}
