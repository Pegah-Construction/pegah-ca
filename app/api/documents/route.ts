import { db } from "@/lib/db";
import { visibleProjectIds } from "@/lib/api-helpers";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const KNOWN_TYPES = ["PDF","XLSX","DWG","DOCX","PPT","ZIP"];

function formatSize(bytes: number) {
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1_024) return `${Math.round(bytes / 1_024)} KB`;
  return `${bytes} B`;
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const projectId = (formData.get("projectId") as string) || "";
  const ownerId = formData.get("ownerId") as string;

  const id = `d_${Date.now().toString(36)}`;
  let name = "Untitled";
  let type = "Other";
  let size = "—";
  let path = "";

  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer();
    const uploadsDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    const filename = `${id}_${file.name}`;
    await writeFile(join(uploadsDir, filename), Buffer.from(bytes));
    path = `/uploads/${filename}`;
    const ext = file.name.split(".").pop()?.toUpperCase() ?? "";
    type = KNOWN_TYPES.includes(ext) ? ext : "Other";
    name = file.name.replace(/\.[^.]+$/, "");
    size = formatSize(file.size);
  }

  const doc = await db.doc.create({
    data: {
      id, name, type,
      projectId: projectId || null, size,
      updated: new Date().toISOString().slice(0, 10),
      ownerId, path,
    },
  });

  return Response.json({
    id: doc.id, name: doc.name, type: doc.type, project: doc.projectId,
    size: doc.size, updated: doc.updated, owner: doc.ownerId, path: doc.path,
  }, { status: 201 });
}

export async function GET(req: Request) {
  const userId = new URL(req.url).searchParams.get("userId");
  if (!userId) return Response.json({ error: "Missing userId" }, { status: 400 });
  const ids = await visibleProjectIds(userId);
  const docs = await db.doc.findMany({
    where: { OR: [{ projectId: null }, { projectId: { in: ids } }] },
    orderBy: { updated: "desc" },
  });
  return Response.json(
    docs.map((d: { id: string; name: string; type: string; projectId: string | null; size: string; updated: string; ownerId: string; path: string }) => ({
      id: d.id, name: d.name, type: d.type, project: d.projectId,
      size: d.size, updated: d.updated, owner: d.ownerId, path: d.path,
    }))
  );
}
