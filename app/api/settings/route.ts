import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { SETTINGS_DEFAULTS, SETTINGS_KEYS } from "@/lib/settings";

export async function GET() {
  const rows = await db.setting.findMany();
  const map: Record<string, string> = { ...SETTINGS_DEFAULTS };
  for (const row of rows) map[row.key] = row.value;
  return Response.json(map);
}

export async function PATCH(req: Request) {
  const body: Record<string, string> = await req.json();
  await Promise.all(
    SETTINGS_KEYS.filter((k) => k in body).map((k) =>
      db.setting.upsert({
        where: { key: k },
        update: { value: body[k] },
        create: { key: k, value: body[k] },
      })
    )
  );
  revalidatePath("/");
  revalidatePath("/contact");
  return Response.json({ ok: true });
}
