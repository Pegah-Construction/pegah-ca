import { db } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const job = await db.jobPosting.update({
    where: { id },
    data: {
      title: body.title,
      department: body.department,
      location: body.location,
      type: body.type,
      description: body.description,
      requirements: body.requirements,
      status: body.status,
    },
  });
  return Response.json(job);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.jobPosting.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
