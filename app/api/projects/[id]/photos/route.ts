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

/**
 * Reorder a project's photos: `{ ids: [3, 1, 2] }`, the whole set in the order
 * they should appear. Order matters beyond the gallery — the first photo is the
 * one the projects page uses as the card image and the one shared links preview
 * — and before this the only way to change it was to delete photos and upload
 * them again in the order you wanted.
 *
 * The list has to name every photo of this project exactly once. Accepting a
 * partial list would mean guessing what happens to the rest, and a list that
 * strayed onto another project's photos would silently reshuffle that project.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const ids: number[] = Array.isArray(body.ids)
    ? body.ids.map(Number).filter((n: number) => Number.isInteger(n))
    : [];
  if (ids.length === 0) {
    return Response.json({ error: "Expected { ids: number[] }" }, { status: 400 });
  }

  const owned = await db.projectPhoto.findMany({ where: { projectId: id }, select: { id: true } });
  const ownedIds = new Set(owned.map((p) => p.id));
  const unique = new Set(ids);
  if (unique.size !== ids.length || ids.length !== owned.length || ids.some((n) => !ownedIds.has(n))) {
    return Response.json(
      { error: "ids must list every photo of this project exactly once." },
      { status: 400 }
    );
  }

  // One transaction, so a half-applied order can't leave two photos claiming
  // the same position.
  await db.$transaction(
    ids.map((photoId, index) =>
      db.projectPhoto.update({ where: { id: photoId }, data: { order: index } })
    )
  );

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  return Response.json({ ok: true, count: ids.length });
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
