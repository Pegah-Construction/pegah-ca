import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { TEAM_BIO_MAX } from "@/lib/about-content";

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
  const { name, title, bio, leadership } = await req.json();
  if (!name || !title) return Response.json({ error: "name and title required" }, { status: 400 });

  // New people join the wider team unless explicitly marked as leadership.
  const isLeader = leadership === true;

  let order: number;
  if (isLeader) {
    // Executives sort by seniority of their (fixed-list) title.
    const titleIndex = TITLE_ORDER.indexOf(title);
    order = titleIndex >= 0 ? titleIndex * 10 : 999;
  } else {
    // Team titles are free text, so there's no seniority to sort by — append
    // instead. Each gets a distinct value, otherwise the reorder arrows in the
    // dashboard would be swapping identical numbers and do nothing. Starting at
    // 1000 keeps the team below leadership in the shared ordering.
    const last = await db.teamMember.findFirst({
      where: { leadership: false },
      orderBy: { order: "desc" },
    });
    order = Math.max(1000, (last?.order ?? 0) + 10);
  }

  const member = await db.teamMember.create({
    data: {
      id: `tm_${Date.now().toString(36)}`,
      order,
      name,
      title,
      // Clamped server-side too — the dashboard limits the input, but the API
      // shouldn't rely on the client to have done it.
      bio: (bio ?? "").slice(0, TEAM_BIO_MAX),
      leadership: isLeader,
    },
  });
  revalidatePath("/about");
  return Response.json(member, { status: 201 });
}
