import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { mergeSafetyContent, type SafetyContent } from "@/lib/safety-content";

// GET — current Health & Safety page content + image.
export async function GET() {
  const [row, imageRow] = await Promise.all([
    db.setting.findUnique({ where: { key: "safety_content" } }),
    db.setting.findUnique({ where: { key: "safety_image" } }),
  ]);
  return Response.json({ content: mergeSafetyContent(row?.value), image: imageRow?.value ?? "" });
}

// PUT — save the editable content.
export async function PUT(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Partial<SafetyContent>;
  const merged = mergeSafetyContent(JSON.stringify(body));
  await db.setting.upsert({
    where: { key: "safety_content" },
    update: { value: JSON.stringify(merged) },
    create: { key: "safety_content", value: JSON.stringify(merged) },
  });
  revalidatePath("/safety");
  return Response.json({ content: merged });
}
