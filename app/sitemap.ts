import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/site";

// Rebuilt per request so new projects / published posts appear promptly.
export const dynamic = "force-dynamic";

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" },
  { path: "/projects", priority: 0.9, changeFrequency: "weekly" },
  { path: "/tenders", priority: 0.8, changeFrequency: "daily" },
  { path: "/safety", priority: 0.6, changeFrequency: "monthly" },
  { path: "/blog", priority: 0.8, changeFrequency: "weekly" },
  { path: "/careers", priority: 0.6, changeFrequency: "weekly" },
  { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
  { path: "/subcontractors/register", priority: 0.5, changeFrequency: "monthly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  let projects: { id: string }[] = [];
  let articles: { slug: string; date: string }[] = [];
  try {
    [projects, articles] = await Promise.all([
      db.project.findMany({ select: { id: true } }),
      db.article.findMany({ where: { status: "Published" }, select: { slug: true, date: true } }),
    ]);
  } catch {
    // Database unavailable — still emit the static routes so the sitemap is valid.
  }

  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${siteUrl}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  for (const p of projects) {
    entries.push({ url: `${siteUrl}/projects/${p.id}`, lastModified: now, changeFrequency: "monthly", priority: 0.6 });
  }
  for (const a of articles) {
    const d = new Date(a.date);
    entries.push({
      url: `${siteUrl}/blog/${a.slug}`,
      lastModified: isNaN(d.getTime()) ? now : d,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}
