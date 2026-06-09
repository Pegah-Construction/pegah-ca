import { db } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const milestones: { n: string; d: string; done: boolean }[] = await req.json();
  await db.milestone.deleteMany({ where: { projectId: id } });
  if (milestones.length > 0) {
    await db.milestone.createMany({ data: milestones.map((m) => ({ n: m.n, d: m.d, done: m.done, projectId: id })) });
  }
  const updated = await db.milestone.findMany({ where: { projectId: id }, orderBy: { id: "asc" } });
  const progress = updated.length > 0 ? Math.round((updated.filter((m) => m.done).length / updated.length) * 100) : 0;
  await db.project.update({ where: { id }, data: { progress } });
  return Response.json({ milestones: updated.map(({ n, d, done }) => ({ n, d, done })), progress });
}
