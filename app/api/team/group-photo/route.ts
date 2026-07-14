import { db } from "@/lib/db";
import { saveFile, deleteFile } from "@/lib/storage";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const row = await db.setting.findUnique({ where: { key: "team_photo" } });
    return Response.json({ photo: row?.value ?? "" });
  } catch {
    return Response.json({ photo: "" });
  }
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return Response.json({ error: "No file" }, { status: 400 });

  const existing = await db.setting.findUnique({ where: { key: "team_photo" } });
  if (existing?.value) await deleteFile(existing.value).catch(() => null);

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  let path: string;
  try {
    path = await saveFile(file, `team/group/${Date.now()}.${ext}`);
  } catch (err) {
    console.error("Group photo upload failed:", err);
    return Response.json({ error: "Upload failed. Please try again." }, { status: 502 });
  }

  await db.setting.upsert({
    where: { key: "team_photo" },
    update: { value: path },
    create: { key: "team_photo", value: path },
  });
  revalidatePath("/about");
  return Response.json({ photo: path });
}

export async function DELETE() {
  const existing = await db.setting.findUnique({ where: { key: "team_photo" } });
  if (existing?.value) await deleteFile(existing.value).catch(() => null);
  await db.setting.deleteMany({ where: { key: "team_photo" } });
  revalidatePath("/about");
  return new Response(null, { status: 204 });
}
