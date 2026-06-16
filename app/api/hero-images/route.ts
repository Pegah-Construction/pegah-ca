import { db } from "@/lib/db";
import { put } from "@vercel/blob";

export async function GET() {
  const images = await db.heroImage.findMany({ orderBy: { order: "asc" } });
  return Response.json(images);
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return Response.json({ error: "No file" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filename = `hero/${Date.now()}.${ext}`;
  const blob = await put(filename, file, { access: "public" });

  const agg = await db.heroImage.aggregate({ _max: { order: true } });
  const order = (agg._max.order ?? -1) + 1;
  const image = await db.heroImage.create({ data: { path: blob.url, order } });
  return Response.json(image, { status: 201 });
}
