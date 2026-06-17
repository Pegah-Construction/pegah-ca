// Client-safe helper — no Node.js imports
// Supabase paths look like "projects/p_abc/123.jpg"
// Local dev paths look like "uploads/projects/p_abc/123.jpg"

export function getStorageUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http")) return path; // backward compat for any existing full URLs
  if (path.startsWith("/") || path.startsWith("uploads/"))
    return path.startsWith("/") ? path : `/${path}`;
  // Supabase relative path — construct public URL
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return base
    ? `${base}/storage/v1/object/public/uploads/${path}`
    : `/${path}`;
}
