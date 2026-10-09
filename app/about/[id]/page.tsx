import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import Reveal from "@/components/Reveal";
import { db } from "@/lib/db";
import { getStorageUrl } from "@/lib/storage-url";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const person = await db.teamMember.findUnique({ where: { id } });
  if (!person) {
    return { title: "Our team", robots: { index: false, follow: true } };
  }
  const description = person.bio || `${person.name}, ${person.title} at Pegah Construction Ltd.`;
  const images = person.photo ? [getStorageUrl(person.photo)] : undefined;
  return {
    title: `${person.name} — ${person.title}`, // template appends " | Pegah Construction Ltd."
    description,
    alternates: { canonical: `/about/${id}` },
    openGraph: { type: "profile", title: person.name, description, url: `${siteUrl}/about/${id}`, images },
  };
}

export default async function PersonPage({ params }: Props) {
  const { id } = await params;
  const person = await db.teamMember.findUnique({ where: { id } });
  if (!person) notFound();

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: person.name,
    jobTitle: person.title,
    image: person.photo ? getStorageUrl(person.photo) : undefined,
    worksFor: { "@type": "Organization", name: "Pegah Construction Ltd.", url: siteUrl },
    url: `${siteUrl}/about/${id}`,
  };

  return (
    <PageShell eyebrow={person.leadership ? "Leadership" : "Our team"} title={person.name} intro={person.title}>
      {/* "<" escaped so a name or title containing "</script>" can't close the tag early. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }} />
      <div className="mx-auto max-w-5xl">
        <Reveal>
          {/* Photo on the left, bio on the right; stacked on phones. */}
          <div className="flex flex-col gap-10 sm:flex-row sm:items-start">
            {person.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={getStorageUrl(person.photo)}
                alt={person.name}
                className="aspect-[4/5] w-full max-w-xs shrink-0 rounded-2xl object-cover shadow-xl sm:w-64 lg:w-80"
              />
            ) : (
              <div className="flex aspect-[4/5] w-full max-w-xs shrink-0 sm:w-64 lg:w-80 items-center justify-center rounded-2xl bg-concrete-100 text-concrete-300">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="h-16 w-16">
                  <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              </div>
            )}
            <section className="min-w-0 flex-1">
              <div className="accent-bar mb-3" />
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink">Biography</h2>
              {person.bio ? (
                <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-concrete-600">{person.bio}</p>
              ) : (
                <p className="mt-4 text-concrete-400">A biography for {person.name} is coming soon.</p>
              )}
            </section>
          </div>
        </Reveal>

        <div className="mt-16 border-t border-concrete-200 pt-8">
          <Link
            href="/about"
            className="inline-flex items-center gap-2 font-mono text-sm uppercase tracking-label text-concrete-500 transition-colors hover:text-ink"
          >
            ← Back to About us
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
