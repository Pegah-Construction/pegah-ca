import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [managed, foreman, tasks, incidents, docs, cards, comments, activities, articles, team] = await Promise.all([
    db.project.count({ where: { pmId: id } }),
    db.project.count({ where: { foremanId: id } }),
    db.task.count({ where: { assigneeId: id } }),
    db.incident.count({ where: { reportedById: id } }),
    db.doc.count({ where: { ownerId: id } }),
    db.card.count({ where: { assigneeId: id } }),
    db.cardComment.count({ where: { who: id } }),
    db.activity.count({ where: { who: id } }),
    db.article.count({ where: { authorId: id } }),
    db.projectTeam.count({ where: { userId: id } }),
  ]);
  if (managed + foreman + tasks + incidents + docs + cards + comments + activities + articles + team > 0) {
    return Response.json({ error: "Cannot delete a user with assigned projects, tasks, or other records." }, { status: 409 });
  }
  await db.user.delete({ where: { id } });
  return new Response(null, { status: 204 });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const allowed = ["name", "email", "role", "title", "phone", "status"] as const;
  const data: Record<string, unknown> = {};
  for (const key of allowed) if (key in body) data[key] = body[key];
  if (body.password?.trim()) {
    data.password = hashPassword(body.password.trim());
  }
  const updated = await db.user.update({ where: { id }, data });
  const { password: _hash, ...rest } = updated;
  return Response.json(rest);
}
