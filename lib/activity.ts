import { db } from "./db";

export async function logActivity(who: string, what: string, projectId?: string | null) {
  try {
    await db.activity.create({ data: { who, what, projectId: projectId ?? null } });
  } catch {
    // non-critical — never let a failed log break the main operation
  }
}
