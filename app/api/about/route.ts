import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { mergeAboutContent, type AboutContent } from "@/lib/about-content";

// GET — current About content (text) + the "What we do" image path.
export async function GET() {
  const [contentRow, imageRow] = await Promise.all([
    db.setting.findUnique({ where: { key: "about_content" } }),
    db.setting.findUnique({ where: { key: "about_image" } }),
  ]);
  return Response.json({
    content: mergeAboutContent(contentRow?.value),
    image: imageRow?.value ?? "",
  });
}

// PUT — save the editable text sections.
export async function PUT(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Partial<AboutContent>;
  const merged = mergeAboutContent(JSON.stringify(body));
  await db.setting.upsert({
    where: { key: "about_content" },
    update: { value: JSON.stringify(merged) },
    create: { key: "about_content", value: JSON.stringify(merged) },
  });
  revalidatePath("/about");
  return Response.json({ content: merged });
}
