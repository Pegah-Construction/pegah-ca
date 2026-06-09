import { db } from "./db";
import { PERMS, type RoleKey } from "./admin";

export async function resolveUser(userId: string | null) {
  if (!userId) return null;
  return db.user.findUnique({ where: { id: userId } });
}

export async function visibleProjectIds(userId: string): Promise<string[]> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return [];
  const role = user.role as RoleKey;
  const scope = PERMS[role].projectScope;
  if (scope === "all") {
    const all = await db.project.findMany({ select: { id: true } });
    return all.map((p) => p.id);
  }
  if (scope === "managed") {
    const managed = await db.project.findMany({ where: { pmId: userId }, select: { id: true } });
    return managed.map((p) => p.id);
  }
  const assigned = await db.project.findMany({
    where: { OR: [{ foremanId: userId }, { team: { some: { userId } } }] },
    select: { id: true },
  });
  return assigned.map((p) => p.id);
}

// Map DB project row → shape expected by existing TypeScript types
export function mapProject(p: {
  id: string; name: string; clientId: string; sector: string; status: string;
  progress: number; budget: number; spent: number; start: string; end: string;
  pmId: string; foremanId: string; location: string;
  milestones: { n: string; d: string; done: boolean }[];
  team: { userId: string }[];
}) {
  return {
    id: p.id,
    name: p.name,
    client: p.clientId,
    sector: p.sector,
    status: p.status,
    progress: p.progress,
    budget: p.budget,
    spent: p.spent,
    start: p.start,
    end: p.end,
    pm: p.pmId,
    foreman: p.foremanId,
    location: p.location,
    team: p.team.map((t) => t.userId),
    milestones: p.milestones.map((m) => ({ n: m.n, d: m.d, done: m.done })),
  };
}

export function mapTender(t: {
  id: string; ref: string; title: string; org: string; platform: string;
  type: string; category: string; value: number; province: string; city: string;
  published: string; closing: string; status: string; tracked: boolean;
  contactName: string; contactEmail: string; contactPhone: string;
  note: string | null; desc: string;
}) {
  return {
    id: t.id, ref: t.ref, title: t.title, org: t.org, platform: t.platform,
    type: t.type, category: t.category, value: t.value, province: t.province,
    city: t.city, published: t.published, closing: t.closing, status: t.status,
    tracked: t.tracked, desc: t.desc, note: t.note ?? undefined,
    contact: { name: t.contactName, email: t.contactEmail, phone: t.contactPhone },
  };
}

export function mapCard(c: {
  id: string; title: string; col: string; projectId: string; assigneeId: string;
  priority: string; due: string;
  subtasks: { t: string; done: boolean }[];
  comments: { who: string; when: string; text: string }[];
}) {
  return {
    id: c.id, title: c.title, col: c.col,
    project: c.projectId, assignee: c.assigneeId,
    priority: c.priority, due: c.due,
    subtasks: c.subtasks.map((s) => ({ t: s.t, done: s.done })),
    comments: c.comments.map((cm) => ({ who: cm.who, when: cm.when, text: cm.text })),
  };
}
