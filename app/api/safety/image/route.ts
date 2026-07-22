import { db } from "@/lib/db";
import { saveFile, deleteFile } from "@/lib/storage";
import { revalidatePath } from "next/cache";

const KEY = "safety_image";

export async function GET() {
  const row = await db.setting.findUnique({ where: { key: KEY } });
  return Response.json({ image: row?.value ?? "" });
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return Response.json({ error: "No file" }, { status: 400 });

  const existing = await db.setting.findUnique({ where: { key: KEY } });
  if (existing?.value) await deleteFile(existing.value).catch(() => null);

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  let path: string;
  try {
    path = await saveFile(file, `safety/${Date.now()}.${ext}`);
  } catch (err) {
    console.error("Safety image upload failed:", err);
    return Response.json({ error: "Upload failed. Please try again." }, { status: 502 });
  }

  await db.setting.upsert({
    where: { key: KEY },
    update: { value: path },
    create: { key: KEY, value: path },
  });
  revalidatePath("/safety");
  return Response.json({ image: path });
}

export async function DELETE() {
  const existing = await db.setting.findUnique({ where: { key: KEY } });
  if (existing?.value) await deleteFile(existing.value).catch(() => null);
  await db.setting.deleteMany({ where: { key: KEY } });
  revalidatePath("/safety");
  return new Response(null, { status: 204 });
}
