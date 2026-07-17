import { db } from "@/lib/db";
import { generateLinkedinPost, isAiConfigured, AiNotConfiguredError } from "@/lib/ai";

// POST — generate a LinkedIn post from this article's own content and save it.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!isAiConfigured()) {
    return Response.json(
      { error: "AI is not configured. Add ANTHROPIC_API_KEY to your environment to generate LinkedIn posts." },
      { status: 503 }
    );
  }

  const article = await db.article.findUnique({ where: { id } });
  if (!article) return Response.json({ error: "Article not found." }, { status: 404 });
  if (!article.body?.trim()) {
    return Response.json({ error: "Add some article content first, then generate the LinkedIn post." }, { status: 400 });
  }

  let post: string;
  try {
    post = await generateLinkedinPost({ title: article.title, excerpt: article.excerpt, bodyHtml: article.body });
  } catch (err) {
    if (err instanceof AiNotConfiguredError) {
      return Response.json({ error: err.message }, { status: 503 });
    }
    console.error("LinkedIn generation failed:", err);
    return Response.json({ error: "LinkedIn generation failed. Please try again." }, { status: 502 });
  }

  await db.article.update({ where: { id }, data: { linkedinPost: post } });
  return Response.json({ linkedinPost: post });
}
