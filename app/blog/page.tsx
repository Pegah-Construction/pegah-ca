import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import PageShell from "@/components/PageShell";

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
          {articles.map((a) => {
            const tags: string[] = JSON.parse(a.tags);
            return (
              <Link
                key={a.id}
                href={`/blog/${a.slug}`}
                className="group flex flex-col rounded-2xl border border-concrete-200 bg-white p-7 transition-shadow hover:shadow-md"
              >
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
              </Link>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
