import { db } from "@/lib/db";
import { saveFile } from "@/lib/storage";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/activity";

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
  let url: string;
  try {
    url = await saveFile(file, `projects/${id}/${Date.now()}.${ext}`);
  } catch (err) {
    console.error("Photo upload failed:", err);
    return Response.json({ error: "Upload failed. Please try again." }, { status: 502 });
  }

  const agg = await db.projectPhoto.aggregate({
    where: { projectId: id },
    _max: { order: true },
  });
  const order = (agg._max.order ?? -1) + 1;
  const photo = await db.projectPhoto.create({ data: { projectId: id, path: url, order } });
  const userId = formData.get("userId") as string | null;
  const project = await db.project.findUnique({ where: { id }, select: { name: true } });
  if (userId && project) await logActivity(userId, `uploaded a photo to "${project.name}"`, id);
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  return Response.json(photo, { status: 201 });
}
