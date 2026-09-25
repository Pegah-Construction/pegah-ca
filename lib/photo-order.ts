// Client-safe helpers for the two dashboard screens that show a project's
// photos: the project page and the edit dialog in the projects list.

/** Move the item at `from` to `to`, returning a new array. */
export function movePhoto<T>(list: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/**
 * Save the order shown in the dashboard. The server takes the full list and
 * renumbers from zero, so what the editor sees is what the website gets.
 */
export async function savePhotoOrder(projectId: string, ids: number[]): Promise<boolean> {
  try {
    const res = await fetch(`/api/projects/${projectId}/photos`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
