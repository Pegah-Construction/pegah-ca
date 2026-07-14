import { db } from "@/lib/db";
import { saveFile, deleteFile } from "@/lib/storage";
import { revalidatePath } from "next/cache";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return Response.json({ error: "No file" }, { status: 400 });

  const article = await db.article.findUnique({ where: { id } });
  if (!article) return Response.json({ error: "Not found" }, { status: 404 });

  if (article.coverImage) await deleteFile(article.coverImage).catch(() => null);

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  let path: string;
  try {
    path = await saveFile(file, `news/${id}/${Date.now()}.${ext}`);
  } catch (err) {
    console.error("Cover upload failed:", err);
    return Response.json({ error: "Upload failed. Please try again." }, { status: 502 });
  }

  const updated = await db.article.update({ where: { id }, data: { coverImage: path } });
  revalidatePath("/blog");
  revalidatePath(`/blog/${updated.slug}`);
  return Response.json({ coverImage: updated.coverImage });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await db.article.findUnique({ where: { id } });
  if (!article) return Response.json({ error: "Not found" }, { status: 404 });

  if (article.coverImage) await deleteFile(article.coverImage).catch(() => null);
  const updated = await db.article.update({ where: { id }, data: { coverImage: "" } });
  revalidatePath("/blog");
  revalidatePath(`/blog/${updated.slug}`);
  return new Response(null, { status: 204 });
}
