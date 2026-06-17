import { db } from "@/lib/db";
import { saveFile } from "@/lib/storage";
import { getStorageUrl } from "@/lib/storage-url";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await db.article.findUnique({ where: { id } });
  if (!article) return Response.json({ error: "Not found" }, { status: 404 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return Response.json({ error: "No file" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = await saveFile(file, `news/${id}/media/${Date.now()}.${ext}`);
  const url = getStorageUrl(path);

  return Response.json({ url }, { status: 201 });
}
