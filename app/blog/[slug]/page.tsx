import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Eyebrow } from "@/components/Brand";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await db.article.findUnique({ where: { slug } });
  return {
    title: article
      ? `${article.title} — Pegah Construction Ltd.`
      : "Article — Pegah Construction Ltd.",
  };
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const article = await db.article.findUnique({
    where: { slug },
    include: { author: true },
  });

  if (!article || article.status !== "Published") notFound();

  const tags: string[] = JSON.parse(article.tags);

  // Next article (published, most recent after this one)
  const next = await db.article.findFirst({
    where: { status: "Published", date: { lt: article.date }, slug: { not: slug } },
    orderBy: { date: "desc" },
  }) ?? await db.article.findFirst({
    where: { status: "Published", slug: { not: slug } },
    orderBy: { date: "desc" },
  });

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="border-b border-concrete-200 bg-white pt-14">
          <div className="mx-auto max-w-8xl px-6 pb-14 lg:px-10">
            <Link href="/blog" className="font-mono text-xs text-concrete-500 hover:text-brand-700">
              ← All articles
            </Link>
            <div className="mt-6 flex flex-wrap gap-2">
              {tags.map((t) => (
                <span key={t} className="inline-block rounded-full bg-brand-50 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-brand-700">
                  {t}
                </span>
              ))}
            </div>
            <h1 className="mt-4 max-w-4xl font-display text-4xl font-black tracking-tight text-ink lg:text-6xl">
              {article.title}
            </h1>
            <p className="mt-4 font-mono text-sm text-concrete-500">
              {article.author.name} · {article.date} · {article.words} words
            </p>
          </div>
        </section>

        {/* Body */}
        <div className="mx-auto max-w-8xl px-6 py-16 lg:px-10">
          <div className="mx-auto max-w-3xl">
            <p className="font-display text-2xl font-bold leading-snug tracking-tight text-ink">
              {article.excerpt}
            </p>

            {article.body ? (
              <div
                className="article-body mt-8 text-lg leading-relaxed text-concrete-600"
                dangerouslySetInnerHTML={{ __html: article.body }}
              />
            ) : null}

            <div className="mt-10 flex items-center gap-4 border-t border-concrete-200 pt-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-700 font-display text-sm font-bold text-white">
                {article.author.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="font-display font-semibold text-ink">{article.author.name}</div>
                <div className="text-sm text-concrete-500">{article.author.title}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Next article */}
        {next && (
          <section className="border-t border-concrete-200 bg-white">
            <div className="mx-auto flex max-w-8xl flex-col gap-4 px-6 py-14 sm:flex-row sm:items-center sm:justify-between lg:px-10">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-label text-concrete-500">
                  Next article
                </p>
                <Link
                  href={`/blog/${next.slug}`}
                  className="mt-2 inline-block font-display text-2xl font-bold tracking-tight text-ink hover:text-brand-700"
                >
                  {next.title} →
                </Link>
              </div>
              <Link href="/blog" className="font-display text-sm font-semibold text-brand-700 hover:text-brand-800">
                Back to all articles
              </Link>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
