import { db } from "./db";
import { PERMS, type RoleKey } from "./admin";

export async function resolveUser(userId: string | null) {
  if (!userId) return null;
  return db.user.findUnique({ where: { id: userId } });
}

export async function visibleProjectIds(userId: string): Promise<string[]> {
  const all = await db.project.findMany({ select: { id: true } });
  const allIds = all.map((p) => p.id);
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return allIds;
  const role = user.role as RoleKey;
  const scope = PERMS[role].projectScope;
  // Always return all projects — pmId/foremanId may not be set in the simplified portfolio model
  if (scope === "all") return allIds;
  if (scope === "managed") {
    const managed = await db.project.findMany({ where: { pmId: userId }, select: { id: true } });
    return managed.length > 0 ? managed.map((p) => p.id) : allIds;
  }
  const assigned = await db.project.findMany({
    where: { OR: [{ foremanId: userId }, { team: { some: { userId } } }] },
    select: { id: true },
  });
  return assigned.length > 0 ? assigned.map((p) => p.id) : allIds;
}

// constructionType is a single string. Some records may hold a legacy JSON
// array (from a brief multi-select experiment) — show the first value.
export function parseConstructionType(v: string | undefined | null): string {
  if (!v) return "";
  try {
    const arr = JSON.parse(v);
    if (Array.isArray(arr)) return arr.length ? String(arr[0]) : "";
    return String(v);
  } catch {
    return v;
  }
}

export function mapProject(p: {
  id: string; name: string; location: string;
  category?: string; type?: string; constructionType?: string; dateCompleted?: string; owner?: string; architect?: string;
  contractType?: string; value?: number; grossFloorArea?: string; description?: string;
  clientId?: string | null; sector?: string; status?: string;
  progress?: number; budget?: number; spent?: number; start?: string; end?: string;
  pmId?: string | null; foremanId?: string | null;
  milestones?: { n: string; d: string; done: boolean }[];
  team?: { userId: string }[];
  photos?: { id: number; path: string; order: number }[];
}) {
  return {
    id: p.id,
    name: p.name,
    location: p.location ?? "",
    category: p.category ?? "",
    type: p.type ?? "",
    constructionType: parseConstructionType(p.constructionType),
    dateCompleted: p.dateCompleted ?? "",
    owner: p.owner ?? "",
    architect: p.architect ?? "",
    contractType: p.contractType ?? "",
    value: p.value ?? 0,
    grossFloorArea: p.grossFloorArea ?? "",
    description: p.description ?? "",
    photos: p.photos ?? [],
    // kept for board/tasks/incidents
    client: p.clientId ?? "",
    sector: p.sector ?? "",
    status: p.status ?? "Active",
    progress: p.progress ?? 0,
    budget: p.budget ?? 0,
    spent: p.spent ?? 0,
    start: p.start ?? "",
    end: p.end ?? "",
    pm: p.pmId ?? "",
    foreman: p.foremanId ?? "",
    team: (p.team ?? []).map((t) => t.userId),
    milestones: (p.milestones ?? []).map((m) => ({ n: m.n, d: m.d, done: m.done })),
  };
}

export function mapTender(t: {
  id: string; ref: string; title: string; org: string; platform: string;
  type: string; category: string; value: number; province: string; city: string;
  published: string; closing: string; status: string; tracked: boolean;
  address?: string; postalCode?: string; bidUrl?: string;
  contactName: string; contactEmail: string; contactPhone: string; contactFax?: string;
  codes?: string;
  note: string | null; desc: string;
}) {
  let codes: string[] = [];
  try { codes = JSON.parse(t.codes ?? "[]"); } catch { codes = []; }
  return {
    id: t.id, ref: t.ref, title: t.title, org: t.org, platform: t.platform,
    type: t.type, category: t.category, value: t.value, province: t.province,
    city: t.city, published: t.published, closing: t.closing, status: t.status,
    tracked: t.tracked, desc: t.desc, note: t.note ?? undefined,
    address: t.address ?? "", postalCode: t.postalCode ?? "", bidUrl: t.bidUrl ?? "",
    codes,
    contact: { name: t.contactName, email: t.contactEmail, phone: t.contactPhone, fax: t.contactFax ?? "" },
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
