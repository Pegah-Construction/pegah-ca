import { db } from "@/lib/db";
import { saveFile } from "@/lib/storage";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const photos = await db.projectPhoto.findMany({
    where: { projectId: id },
    orderBy: { order: "asc" },
  });
  return Response.json(photos);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return Response.json({ error: "No file" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const url = await saveFile(file, `uploads/projects/${id}/${Date.now()}.${ext}`);

  const agg = await db.projectPhoto.aggregate({
    where: { projectId: id },
    _max: { order: true },
  });
  const order = (agg._max.order ?? -1) + 1;
  const photo = await db.projectPhoto.create({ data: { projectId: id, path: url, order } });
  return Response.json(photo, { status: 201 });
}
