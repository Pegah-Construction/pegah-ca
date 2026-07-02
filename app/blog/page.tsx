import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import PageShell from "@/components/PageShell";
import Reveal from "@/components/Reveal";
import { getStorageUrl } from "@/lib/storage-url";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog — Pegah Construction Ltd.",
};

export default async function BlogPage() {
  const articles = await db.article.findMany({
    where: { status: "Published" },
    include: { author: true },
    orderBy: [{ featured: "desc" }, { date: "desc" }],
  });

  return (
    <PageShell
      eyebrow="Insights & case studies"
      title="Blog"
      intro="Construction perspectives, project stories and industry thinking from the Pegah team."
    >
      {articles.length === 0 ? (
        <p className="text-concrete-500">No articles published yet.</p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a, i) => {
            const tags: string[] = JSON.parse(a.tags);
            return (
              <Reveal key={a.id} delay={(i % 3) * 80} direction="up">
                <Link
                  href={`/blog/${a.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-concrete-200 bg-white transition-shadow hover:shadow-md"
                >
                  {a.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getStorageUrl(a.coverImage)}
                      alt={a.title}
                      className="aspect-[16/9] w-full object-cover"
                    />
                  ) : (
                    <div className="aspect-[16/9] w-full bg-[radial-gradient(ellipse_80%_60%_at_60%_40%,theme(colors.brand.700),theme(colors.brand.900))]" />
                  )}

                  <div className="flex flex-1 flex-col p-7">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map((t) => (
                          <span key={t} className="inline-block rounded-full bg-brand-50 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-brand-700">
                            {t}
                          </span>
                        ))}
                      </div>
                      {a.featured && (
                        <span className="shrink-0 text-amber-400" title="Featured">★</span>
                      )}
                    </div>

                    <h2 className="mt-4 font-display text-lg font-bold leading-snug tracking-tight text-ink group-hover:text-brand-700">
                      {a.title}
                    </h2>

                    <p className="mt-3 flex-1 text-sm leading-relaxed text-concrete-500">
                      {a.excerpt}
                    </p>

                    <div className="mt-5 flex items-center justify-between border-t border-concrete-100 pt-4">
                      <span className="text-xs text-concrete-500">{a.author.name}</span>
                      <span className="font-mono text-[11px] text-concrete-400">{a.date}</span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
