import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import LikeButton from "@/components/LikeButton";
import ShareLinks from "@/components/ShareLinks";
import Comments from "@/components/Comments";
import { getStorageUrl } from "@/lib/storage-url";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await db.article.findUnique({ where: { slug } });
  if (!article) {
    return { title: "Article", robots: { index: false, follow: true } };
  }
  const url = `${siteUrl}/blog/${slug}`;
  const images = article.coverImage ? [getStorageUrl(article.coverImage)] : undefined;
  return {
    title: article.title, // template appends " | Pegah Construction Ltd."
    description: article.excerpt || undefined,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt || undefined,
      url,
      publishedTime: article.date || undefined,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt || undefined,
      images,
    },
  };
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const article = await db.article.findUnique({
    where: { slug },
    // The like count is rendered server-side so it's correct on first paint;
    // whether this reader already liked it is filled in by the button.
    include: { author: true, _count: { select: { likes: true } } },
  });

  if (!article || article.status !== "Published") notFound();

  // Same canonical URL the metadata advertises — what gets shared should be the
  // public address, not whatever host happens to be serving the page.
  const url = `${siteUrl}/blog/${slug}`;

  const tags: string[] = JSON.parse(article.tags);

  // Neighbours in both directions — "previous" is the next one back in time and
  // "next" the one after it, so either is absent at the ends of the run. The
  // recommended row is the newest three others, featured ones first.
  const [older, newer, recommended] = await Promise.all([
    db.article.findFirst({
      where: { status: "Published", date: { lt: article.date }, slug: { not: slug } },
      orderBy: { date: "desc" },
      select: { slug: true, title: true },
    }),
    db.article.findFirst({
      where: { status: "Published", date: { gt: article.date }, slug: { not: slug } },
      orderBy: { date: "asc" },
      select: { slug: true, title: true },
    }),
    db.article.findMany({
      where: { status: "Published", slug: { not: slug } },
      orderBy: [{ featured: "desc" }, { date: "desc" }],
      take: 3,
      select: { id: true, slug: true, title: true, excerpt: true, date: true, coverImage: true },
    }),
  ]);

  const initials = article.author.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt || undefined,
    datePublished: article.date || undefined,
    image: article.coverImage ? getStorageUrl(article.coverImage) : `${siteUrl}/opengraph-image.png`,
    author: { "@type": "Organization", name: "Pegah Construction Ltd.", url: siteUrl },
    publisher: {
      "@type": "Organization",
      name: "Pegah Construction Ltd.",
      logo: { "@type": "ImageObject", url: `${siteUrl}/logo.webp` },
    },
    mainEntityOfPage: `${siteUrl}/blog/${article.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
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

            {/* The tags now read as the keywords line under the body, the way a
                post's keyword list usually does, so only the badge sits here. */}
            {article.featured && (
              <div className="hero-animate mb-5" style={{ animationDelay: "100ms" }}>
                <span className="inline-block rounded-full border border-amber-400/60 bg-amber-400/20 px-3.5 py-1 font-mono text-xs uppercase tracking-label text-amber-300">
                  Featured
                </span>
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
                  className="article-body text-lg leading-relaxed text-ink"
                  dangerouslySetInnerHTML={{ __html: article.body }}
                />
              ) : null}
            </Reveal>

            {/* Keywords — the article's own tags, listed rather than shown as
                pills up in the hero. */}
            {tags.length > 0 && (
              <Reveal delay={40}>
                <p className="mt-12 border-t border-concrete-200 pt-8 leading-relaxed text-concrete-500">
                  <span className="font-display font-semibold text-ink">Keywords: </span>
                  {tags.join(", ")}
                </p>
              </Reveal>
            )}

            {/* Like + share — at the end, where someone has actually read the piece */}
            <Reveal delay={80}>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <LikeButton articleId={article.id} initialCount={article._count.likes} />
                {/* Canonical URL, not the current host — a shared link should
                    point at the public site. */}
                <ShareLinks url={url} title={article.title} />
              </div>
            </Reveal>

            {/* Comments */}
            <Comments articleId={article.id} />

            {/* Author footer */}
            <Reveal delay={100}>
              <div className="mt-8 flex items-center gap-4 border-t border-concrete-200 pt-8">
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

        {/* ── Previous / next ── */}
        {(older || newer) && (
          <section className="border-t border-concrete-200 bg-surface">
            <div className="mx-auto grid max-w-4xl gap-8 px-6 py-12 sm:grid-cols-2 lg:px-10">
              {older ? (
                <Link href={`/blog/${older.slug}`} className="group">
                  <p className="font-mono text-[11px] uppercase tracking-label text-accent-700">
                    ← Previous article
                  </p>
                  <p className="mt-2 font-display text-lg font-bold leading-snug tracking-tight text-ink group-hover:text-brand-700">
                    {older.title}
                  </p>
                </Link>
              ) : (
                <div />
              )}
              {newer ? (
                <Link href={`/blog/${newer.slug}`} className="group sm:text-right">
                  <p className="font-mono text-[11px] uppercase tracking-label text-accent-700">
                    Next article →
                  </p>
                  <p className="mt-2 font-display text-lg font-bold leading-snug tracking-tight text-ink group-hover:text-brand-700">
                    {newer.title}
                  </p>
                </Link>
              ) : null}
            </div>
          </section>
        )}

        {/* ── Recommended posts ── */}
        {recommended.length > 0 && (
          <section className="grid-surface border-t border-concrete-200">
            <div className="mx-auto max-w-8xl px-6 py-16 lg:px-10">
              <Reveal>
                <p className="font-mono text-[11px] uppercase tracking-label text-accent-700">Keep reading</p>
                <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink lg:text-3xl">
                  Recommended posts
                </h2>
              </Reveal>

              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {recommended.map((a, i) => (
                  <Reveal key={a.id} delay={i * 80} direction="up">
                    <Link
                      href={`/blog/${a.slug}`}
                      className="blog-card group flex h-full flex-col overflow-hidden rounded-2xl border-2 border-concrete-200 bg-surface"
                    >
                      <div className="blog-card-media aspect-[16/9] w-full overflow-hidden">
                        {a.coverImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={getStorageUrl(a.coverImage)}
                            alt={a.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-[radial-gradient(ellipse_80%_60%_at_60%_40%,theme(colors.brand.700),theme(colors.brand.900))]" />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col p-6">
                        <h3 className="font-display text-base font-bold leading-snug tracking-tight text-ink group-hover:text-brand-700">
                          {a.title}
                        </h3>
                        <p className="mt-2 flex-1 text-sm leading-relaxed text-concrete-500">{a.excerpt}</p>
                        <span className="mt-4 font-mono text-[11px] text-concrete-400">{a.date}</span>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>

              <Reveal delay={240}>
                <Link
                  href="/blog"
                  className="mt-8 inline-flex font-display text-sm font-semibold text-brand-700 hover:text-brand-800"
                >
                  ← All articles
                </Link>
              </Reveal>
            </div>
          </section>
        )}

      </main>
      <Footer />
    </>
  );
}
