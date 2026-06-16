import { db } from "@/lib/db";

const DEFAULTS: Record<string, string> = {
  companyName: "Pegah Construction Ltd.",
  phone: "416 739 9300",
  email: "info@pegah.ca",
  address: "5050 Dufferin Street, Toronto",
};

export async function GET() {
  const rows = await db.setting.findMany();
  const map: Record<string, string> = { ...DEFAULTS };
  for (const row of rows) map[row.key] = row.value;
  return Response.json(map);
}

export async function PATCH(req: Request) {
  const body: Record<string, string> = await req.json();
  const allowed = ["companyName", "phone", "email", "address"] as const;
  await Promise.all(
    allowed
      .filter((k) => k in body)
      .map((k) =>
        db.setting.upsert({
          where: { key: k },
          update: { value: body[k] },
          create: { key: k, value: body[k] },
        })
      )
  );
  return Response.json({ ok: true });
}
