// Client-safe helper — no Node.js imports.
// Vercel Blob paths are stored as full URLs (https://….blob.vercel-storage.com/…).
// Local dev paths look like "uploads/projects/p_abc/123.jpg".

export function getStorageUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http")) return path; // Vercel Blob / absolute URLs
  if (path.startsWith("/")) return path;
  if (path.startsWith("uploads/")) return `/${path}`;
  // Legacy relative path — served from /public if present.
  return `/${path}`;
}
