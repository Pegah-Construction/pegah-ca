// Claude-backed blog-post generation for projects.
// Uses the Anthropic Messages API directly via fetch (no SDK dependency).
//
// Env:
//   ANTHROPIC_API_KEY  — required for generation
//   ANTHROPIC_MODEL    — optional model override (default: claude-sonnet-4-6)

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-sonnet-4-6";

export class AiNotConfiguredError extends Error {
  constructor() {
    super("AI is not configured. Set ANTHROPIC_API_KEY in your environment.");
    this.name = "AiNotConfiguredError";
  }
}

export function isAiConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

export type ProjectFacts = {
  name: string;
  location?: string;
  category?: string;
  type?: string;
  owner?: string;
  architect?: string;
  contractType?: string;
  value?: number;
  grossFloorArea?: string;
  dateCompleted?: string;
  description?: string;
};

// A document to feed the model: either a PDF (base64) or plain text.
export type SourceDoc =
  | { name: string; kind: "pdf"; base64: string }
  | { name: string; kind: "text"; text: string };

export type GeneratedArticle = {
  title: string;
  excerpt: string;
  tags: string[];
  bodyHtml: string;
};

type ContentBlock =
  | { type: "text"; text: string }
  | { type: "document"; source: { type: "base64"; media_type: "application/pdf"; data: string } };

const SYSTEM = `You are the content writer for Pegah Construction Ltd., a Ontario general contractor. You write polished, credible case-study style blog posts about completed and in-progress construction projects for the company's public website.

Guidelines:
- Write in a professional, confident, third-person voice ("Pegah Construction delivered…"). Never invent facts, figures, awards, quotes, or client names that are not present in the provided material. If a detail is unknown, write around it rather than fabricating.
- Structure the body with 3–5 short sections using <h2> subheadings. Open with a strong lead paragraph (no heading).
- Length: roughly 400–650 words.
- Output body as clean semantic HTML using ONLY these tags: <p>, <h2>, <h3>, <ul>, <li>, <strong>, <blockquote>. No inline styles, no <html>/<head>/<body>, no images, no links.
- Tags: 2–4 short topical tags (e.g. "Commercial", "Design-Build", "Markham").

Respond with ONLY a single JSON object, no markdown fences, of exactly this shape:
{"title": string, "excerpt": string (1–2 sentences, max ~200 chars), "tags": string[], "bodyHtml": string}`;

function factsToText(f: ProjectFacts): string {
  const lines: string[] = [`Project name: ${f.name}`];
  if (f.location) lines.push(`Location: ${f.location}`);
  if (f.category) lines.push(`Category: ${f.category}`);
  if (f.type) lines.push(`Project type: ${f.type}`);
  if (f.contractType) lines.push(`Contract type: ${f.contractType}`);
  if (typeof f.value === "number" && f.value > 0) lines.push(`Contract value: $${f.value.toLocaleString("en-US")}`);
  if (f.owner) lines.push(`Owner/client: ${f.owner}`);
  if (f.architect) lines.push(`Architect: ${f.architect}`);
  if (f.grossFloorArea) lines.push(`Gross floor area: ${f.grossFloorArea}`);
  if (f.dateCompleted) lines.push(`Completion year: ${f.dateCompleted.slice(0, 4)}`);
  if (f.description) lines.push(`\nProject description provided by the team:\n${f.description}`);
  return lines.join("\n");
}

function stripFences(s: string): string {
  return s.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
}

export async function generateProjectArticle(
  facts: ProjectFacts,
  docs: SourceDoc[]
): Promise<GeneratedArticle> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new AiNotConfiguredError();
  const model = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;

  const content: ContentBlock[] = [
    {
      type: "text",
      text:
        `Write a blog post about the following Pegah Construction project.\n\n` +
        `=== PROJECT DETAILS ===\n${factsToText(facts)}\n` +
        (docs.length
          ? `\n=== ATTACHED PROJECT DOCUMENTS ===\nUse relevant, factual details from the attached documents where helpful, but do not fabricate.`
          : `\nNo additional documents were available; base the post on the project details above.`),
    },
  ];

  for (const d of docs) {
    if (d.kind === "pdf") {
      content.push({ type: "text", text: `Document: ${d.name}` });
      content.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: d.base64 } });
    } else {
      const clipped = d.text.slice(0, 20000);
      content.push({ type: "text", text: `Document: ${d.name}\n"""\n${clipped}\n"""` });
    }
  }

  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 2500,
      system: SYSTEM,
      messages: [{ role: "user", content }],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Anthropic API error (${res.status}): ${detail.slice(0, 500)}`);
  }

  const data = await res.json();
  const raw: string = (data?.content ?? [])
    .filter((b: { type: string }) => b.type === "text")
    .map((b: { text: string }) => b.text)
    .join("")
    .trim();

  let parsed: GeneratedArticle;
  try {
    parsed = JSON.parse(stripFences(raw));
  } catch {
    throw new Error("The model did not return valid JSON.");
  }

  if (!parsed.title || !parsed.bodyHtml) {
    throw new Error("The generated article was missing a title or body.");
  }
  return {
    title: String(parsed.title).trim(),
    excerpt: String(parsed.excerpt ?? "").trim(),
    tags: Array.isArray(parsed.tags) ? parsed.tags.map((t) => String(t).trim()).filter(Boolean).slice(0, 5) : [],
    bodyHtml: String(parsed.bodyHtml).trim(),
  };
}

// ── LinkedIn post generation from a published/edited blog article ──────────────
const LINKEDIN_SYSTEM = `You are the social-media writer for Pegah Construction Ltd., a Ontario general contractor. Write a single LinkedIn post promoting the given blog article.

Guidelines:
- Start with a strong one-line hook. Keep it ~120–220 words / under ~1,300 characters.
- Short paragraphs separated by blank lines; a tasteful emoji or two is fine (don't overdo it).
- Company voice — third person ("Pegah Construction…") or first-person plural ("We're proud to…").
- Base it ONLY on the article content provided; never invent facts, figures, awards, or names.
- End with 3–5 relevant hashtags on their own line (e.g. #Construction #DesignBuild #Ontario).

Respond with ONLY the post text — no preamble, no quotes, no markdown code fences.`;

export async function generateLinkedinPost(article: {
  title: string;
  excerpt: string;
  bodyHtml: string;
}): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new AiNotConfiguredError();
  const model = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;

  const bodyText = (article.bodyHtml || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const userText =
    `Blog article to promote on LinkedIn:\n\n` +
    `Title: ${article.title}\n` +
    (article.excerpt ? `Summary: ${article.excerpt}\n` : "") +
    `\nArticle body:\n${bodyText.slice(0, 8000)}`;

  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1000,
      system: LINKEDIN_SYSTEM,
      messages: [{ role: "user", content: userText }],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Anthropic API error (${res.status}): ${detail.slice(0, 500)}`);
  }

  const data = await res.json();
  const text: string = (data?.content ?? [])
    .filter((b: { type: string }) => b.type === "text")
    .map((b: { text: string }) => b.text)
    .join("")
    .trim();

  if (!text) throw new Error("The model returned an empty LinkedIn post.");
  return stripFences(text);
}
