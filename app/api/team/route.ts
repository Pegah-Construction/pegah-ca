import { db } from "@/lib/db";

const TITLE_ORDER = [
  "President",
  "Vice President",
  "Chief Executive Officer",
  "Chief Operating Officer",
  "Chief Financial Officer",
  "Director of Operations",
  "Project Director",
];

export async function GET() {
  try {
    const members = await db.teamMember.findMany({ orderBy: { order: "asc" } });
    return Response.json(members);
  } catch {
    return Response.json([]);
  }
}

export async function POST(req: Request) {
  const { name, title, bio } = await req.json();
  if (!name || !title) return Response.json({ error: "name and title required" }, { status: 400 });

  const titleIndex = TITLE_ORDER.indexOf(title);
  const order = titleIndex >= 0 ? titleIndex * 10 : 999;

  const member = await db.teamMember.create({
    data: { id: `tm_${Date.now().toString(36)}`, order, name, title, bio: bio ?? "" },
  });
  return Response.json(member, { status: 201 });
}
