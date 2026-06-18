import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all") === "1";

  const jobs = await db.jobPosting.findMany({
    where: all ? undefined : { status: "Published" },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(jobs);
}

export async function POST(req: Request) {
  const body = await req.json();
  const id = `job_${Date.now().toString(36)}`;
  const job = await db.jobPosting.create({
    data: {
      id,
      title: body.title,
      department: body.department ?? "",
      location: body.location ?? "Toronto, ON",
      type: body.type ?? "Full-time",
      description: body.description ?? "",
      requirements: body.requirements ?? "",
      status: body.status ?? "Draft",
    },
  });
  return Response.json(job, { status: 201 });
}
