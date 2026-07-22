import { db } from "./db";
import { SETTINGS_DEFAULTS } from "./settings";

// Server-side reader for the editable org/contact/home settings.
export async function getSiteSettings(): Promise<Record<string, string>> {
  const map: Record<string, string> = { ...SETTINGS_DEFAULTS };
  try {
    const rows = await db.setting.findMany();
    for (const r of rows) if (r.key in map) map[r.key] = r.value;
  } catch {
    // fall back to defaults if the DB is unreachable
  }
  return map;
}
