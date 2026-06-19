import { db } from "@/lib/db";
import { saveFile, deleteFile } from "@/lib/storage";
import { revalidatePath } from "next/cache";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return Response.json({ error: "No file" }, { status: 400 });

  const member = await db.teamMember.findUnique({ where: { id } });
  if (!member) return Response.json({ error: "Not found" }, { status: 404 });

  if (member.photo) await deleteFile(member.photo).catch(() => null);

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = await saveFile(file, `team/${id}/${Date.now()}.${ext}`);

  const updated = await db.teamMember.update({ where: { id }, data: { photo: path } });
  revalidatePath("/about");
  return Response.json({ photo: updated.photo });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = await db.teamMember.findUnique({ where: { id } });
  if (!member) return Response.json({ error: "Not found" }, { status: 404 });

  if (member.photo) await deleteFile(member.photo).catch(() => null);
  const updated = await db.teamMember.update({ where: { id }, data: { photo: "" } });
  revalidatePath("/about");
  return Response.json({ photo: updated.photo });
}
