import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";

export async function POST(req: Request) {
  const body = await req.json();
  const id = `n_${Date.now().toString(36)}`;
  const slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const words = Math.max(50, Math.round((body.excerpt?.split(" ").length ?? 10) * 8));
  const article = await db.article.create({
    data: {
      id, title: body.title, slug, projectId: null,
      authorId: body.authorId, status: "Draft",
      date: new Date().toISOString().slice(0, 10),
      tags: JSON.stringify(body.tags || []),
      featured: false, excerpt: body.excerpt || "", body: body.body || "", words,
    },
  });
  await logActivity(body.authorId, `created article "${article.title}"`);
  return Response.json({
    id: article.id, title: article.title, slug: article.slug, project: null,
    author: article.authorId, status: article.status, date: article.date,
    tags: JSON.parse(article.tags), featured: article.featured,
    excerpt: article.excerpt, body: article.body, coverImage: article.coverImage,
    linkedinPost: article.linkedinPost, instagramPost: article.instagramPost, words: article.words,
  }, { status: 201 });
}

export async function GET() {
  const articles = await db.article.findMany({ orderBy: { date: "desc" } });
  return Response.json(
    articles.map((a) => ({
      id: a.id, title: a.title, slug: a.slug, project: a.projectId,
      author: a.authorId, status: a.status, date: a.date, tags: JSON.parse(a.tags),
      featured: a.featured, excerpt: a.excerpt, body: a.body ?? "",
      coverImage: a.coverImage ?? "", linkedinPost: a.linkedinPost ?? "",
      instagramPost: a.instagramPost ?? "", words: a.words,
    }))
  );
}
