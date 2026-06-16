import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function GET() {
  const images = await db.heroImage.findMany({ orderBy: { order: "asc" } });
  return Response.json(images);
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return Response.json({ error: "No file" }, { status: 400 });

  const dir = join(process.cwd(), "public", "uploads", "hero");
  await mkdir(dir, { recursive: true });

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filename = `${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(join(dir, filename), buffer);

  const path = `/uploads/hero/${filename}`;
  const agg = await db.heroImage.aggregate({ _max: { order: true } });
  const order = (agg._max.order ?? -1) + 1;
  const image = await db.heroImage.create({ data: { path, order } });
  return Response.json(image, { status: 201 });
}
