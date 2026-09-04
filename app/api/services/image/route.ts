import { saveFile, deleteFile } from "@/lib/storage";

/**
 * Card images for the home page services section. The path this returns is
 * stored inside the `servicesList` setting line itself, so this route only
 * moves the file — saving the Services editor is what publishes it.
 */
export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return Response.json({ error: "No file" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  let path: string;
  try {
    path = await saveFile(file, `services/${Date.now()}.${ext}`);
  } catch (err) {
    console.error("Service image upload failed:", err);
    return Response.json({ error: "Upload failed. Please try again." }, { status: 502 });
  }

  // Replacing an image leaves the old file unreferenced — drop it.
  const previous = String(formData.get("previous") ?? "");
  if (previous && previous !== path) await deleteFile(previous).catch(() => null);

  return Response.json({ image: path });
}

export async function DELETE(req: Request) {
  const path = new URL(req.url).searchParams.get("path") ?? "";
  if (path) await deleteFile(path).catch(() => null);
  return new Response(null, { status: 204 });
}
