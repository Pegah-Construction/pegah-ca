import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { getStorageUrl } from "@/lib/storage-url";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await db.article.findUnique({ where: { slug } });
  return {
    title: article
      ? `${article.title} | Pegah Construction Ltd.`
      : "Article | Pegah Construction Ltd.",
    description: article?.excerpt ?? undefined,
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

  const next =
    (await db.article.findFirst({
      where: { status: "Published", date: { lt: article.date }, slug: { not: slug } },
      orderBy: { date: "desc" },
    })) ??
    (await db.article.findFirst({
      where: { status: "Published", slug: { not: slug } },
      orderBy: { date: "desc" },
    }));

  const initials = article.author.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <Navbar />
      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 90% 80% at 30% 40%, #1f3a93, #0f1f4d)" }}
          />
          {/* subtle grid texture */}
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 0,transparent 60px)",
            }}
          />

          <div className="relative mx-auto max-w-4xl px-6 pb-16 pt-32 lg:px-10">
            {/* back link */}
            <Link
              href="/blog"
              className="hero-animate mb-8 inline-flex items-center gap-2 font-mono text-sm uppercase tracking-label text-white/60 transition-colors hover:text-white"
              style={{ animationDelay: "0ms" }}
            >
              ← All articles
            </Link>

            {/* eyebrow: tags */}
            {tags.length > 0 && (
              <div className="hero-animate mb-5 flex flex-wrap items-center gap-2" style={{ animationDelay: "100ms" }}>
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-block rounded-full border border-white/25 bg-white/10 px-3.5 py-1 font-mono text-xs uppercase tracking-label text-white/80"
                  >
                    {t}
                  </span>
                ))}
                {article.featured && (
                  <span className="inline-block rounded-full border border-amber-400/60 bg-amber-400/20 px-3.5 py-1 font-mono text-xs uppercase tracking-label text-amber-300">
                    Featured
                  </span>
                )}
              </div>
            )}

            {/* title */}
            <h1 className="hero-animate font-display text-4xl font-black leading-[1.1] tracking-tight text-white lg:text-6xl" style={{ animationDelay: "180ms" }}>
              {article.title}
            </h1>

            {/* meta strip */}
            <div className="hero-animate mt-8 flex flex-wrap gap-x-10 gap-y-3 border-t border-white/10 pt-6" style={{ animationDelay: "300ms" }}>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-xs uppercase tracking-label text-white/45">Author</span>
                <span className="font-medium text-white">{article.author.name}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-xs uppercase tracking-label text-white/45">Published</span>
                <span className="font-medium text-white">{article.date}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-xs uppercase tracking-label text-white/45">Reading time</span>
                <span className="font-medium text-white">
                  {Math.ceil(article.words / 200)} min read
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Cover image ── */}
        {article.coverImage && (
          <div className="mx-auto max-w-4xl px-6 pt-10 lg:px-10">
            <Reveal>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getStorageUrl(article.coverImage)}
                alt={article.title}
                className="aspect-[21/9] w-full rounded-2xl object-cover shadow-xl"
              />
            </Reveal>
          </div>
        )}

        {/* ── Article body ── */}
        <div className="mx-auto max-w-4xl px-6 py-16 lg:px-10">
          <div className="mx-auto max-w-3xl">

            <Reveal>
              {/* Excerpt as lead paragraph */}
              <p className="font-body text-lg font-normal leading-relaxed text-concrete-600 lg:text-xl">
                {article.excerpt}
              </p>

              {/* Divider */}
              <div className="my-16 h-px bg-concrete-200" />

              {/* Rich text body */}
              {article.body ? (
                <div
                  className="article-body text-lg leading-relaxed text-concrete-600"
                  dangerouslySetInnerHTML={{ __html: article.body }}
                />
              ) : null}
            </Reveal>

            {/* Author footer */}
            <Reveal delay={100}>
              <div className="mt-12 flex items-center gap-4 border-t border-concrete-200 pt-8">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-800 font-display text-base font-bold text-white">
                  {initials}
                </div>
                <div>
                  <div className="font-display font-semibold text-ink">{article.author.name}</div>
                  <div className="mt-0.5 text-sm text-concrete-500">{article.author.title}</div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* ── Next article ── */}
        {next && (
          <section className="border-t border-concrete-200 bg-white">
            <Reveal className="mx-auto flex max-w-4xl flex-col gap-4 px-6 py-14 sm:flex-row sm:items-center sm:justify-between lg:px-10">
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
              <Link
                href="/blog"
                className="shrink-0 font-display text-sm font-semibold text-brand-700 hover:text-brand-800"
              >
                Back to all articles
              </Link>
            </Reveal>
          </section>
        )}

      </main>
      <Footer />
    </>
  );
}
