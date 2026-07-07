import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { readFileBytes, mediaTypeFor } from "@/lib/storage";
import { generateProjectArticle, isAiConfigured, AiNotConfiguredError, type SourceDoc } from "@/lib/ai";

const MAX_DOCS = 5;
const MAX_TOTAL_BYTES = 15 * 1024 * 1024; // 15 MB budget across attached docs

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80) || "post";
}

function countWords(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text ? text.split(" ").length : 0;
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!isAiConfigured()) {
    return Response.json(
      { error: "AI is not configured. Add ANTHROPIC_API_KEY to your environment to enable blog generation." },
      { status: 503 }
    );
  }

  const { userId } = await req.json().catch(() => ({}));
  if (!userId) {
    return Response.json({ error: "Missing userId." }, { status: 400 });
  }
  const author = await db.user.findUnique({ where: { id: String(userId) } });
  if (!author) {
    return Response.json({ error: "Author not found." }, { status: 401 });
  }

  const project = await db.project.findUnique({
    where: { id },
    include: {
      photos: { orderBy: { order: "asc" } },
      docs: { take: MAX_DOCS + 5 },
    },
  });
  if (!project) {
    return Response.json({ error: "Project not found." }, { status: 404 });
  }

  // Gather document contents best-effort. Skip anything unreachable/unsupported.
  const docs: SourceDoc[] = [];
  const warnings: string[] = [];
  let budget = MAX_TOTAL_BYTES;

  for (const doc of project.docs) {
    if (docs.length >= MAX_DOCS) break;
    if (!doc.path) { warnings.push(`"${doc.name}" has no stored file — skipped.`); continue; }

    const media = mediaTypeFor(doc.path);
    const isPdf = media === "application/pdf";
    const isText = media.startsWith("text/") || media === "application/json";
    if (!isPdf && !isText) {
      warnings.push(`"${doc.name}" (${media}) is an unsupported type — skipped.`);
      continue;
    }

    const bytes = await readFileBytes(doc.path);
    if (!bytes) {
      warnings.push(`"${doc.name}" could not be read from storage — skipped.`);
      continue;
    }
    if (bytes.length > budget) {
      warnings.push(`"${doc.name}" exceeds the size budget — skipped.`);
      continue;
    }
    budget -= bytes.length;

    if (isPdf) {
      docs.push({ name: doc.name, kind: "pdf", base64: bytes.toString("base64") });
    } else {
      docs.push({ name: doc.name, kind: "text", text: bytes.toString("utf8") });
    }
  }

  // Generate the article via Claude.
  let generated;
  try {
    generated = await generateProjectArticle(
      {
        name: project.name,
        location: project.location,
        category: project.category,
        type: project.type,
        owner: project.owner,
        architect: project.architect,
        contractType: project.contractType,
        value: project.value,
        grossFloorArea: project.grossFloorArea,
        dateCompleted: project.dateCompleted,
        description: project.description,
      },
      docs
    );
  } catch (err) {
    if (err instanceof AiNotConfiguredError) {
      return Response.json({ error: err.message }, { status: 503 });
    }
    console.error("Article generation failed:", err);
    return Response.json({ error: "Blog generation failed. Please try again." }, { status: 502 });
  }

  // Ensure a unique slug.
  let slug = slugify(generated.title);
  if (await db.article.findUnique({ where: { slug } })) {
    slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
  }

  const article = await db.article.create({
    data: {
      id: `n_${Date.now().toString(36)}`,
      title: generated.title,
      slug,
      projectId: project.id,
      authorId: author.id,
      status: "Draft",
      date: new Date().toISOString().slice(0, 10),
      tags: JSON.stringify(generated.tags),
      featured: false,
      excerpt: generated.excerpt,
      body: generated.bodyHtml,
      linkedinPost: generated.linkedinPost,
      coverImage: project.photos[0]?.path ?? "",
      words: countWords(generated.bodyHtml),
    },
  });

  await logActivity(author.id, `generated a blog draft "${article.title}"`, project.id);

  return Response.json(
    {
      id: article.id,
      title: article.title,
      slug: article.slug,
      status: article.status,
      docsUsed: docs.length,
      warnings,
    },
    { status: 201 }
  );
}
