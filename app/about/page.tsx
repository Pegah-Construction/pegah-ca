import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { Eyebrow } from "@/components/Brand";
import Reveal from "@/components/Reveal";
import { db } from "@/lib/db";
import { getStorageUrl } from "@/lib/storage-url";

export const metadata: Metadata = { title: "About — Pegah Construction Ltd." };

export default async function AboutPage() {
  const [members, teamPhotoRow] = await Promise.all([
    db.teamMember.findMany({ orderBy: { order: "asc" } }),
    db.setting.findUnique({ where: { key: "team_photo" } }),
  ]);
  const teamPhoto = teamPhotoRow?.value ?? "";

  return (
    <PageShell
      eyebrow="Our story"
      title="35+ years of quality workmanship."
      intro="Established in 1988, Pegah Construction Ltd. has built a solid reputation across Ontario as an industrious, reliable team-player."
    >
      <Reveal>
        <p className="max-w-2xl text-lg leading-relaxed text-concrete-500">
          Content for the About page goes here — company history, the
          Design-Build approach, and the team behind the work.
        </p>
      </Reveal>

      <section className="mt-20">
        <Reveal>
          <Eyebrow>Leadership</Eyebrow>
          <h2 className="mt-4 max-w-2xl font-display text-3xl font-bold tracking-tight text-ink lg:text-4xl">
            The people guiding our work.
          </h2>
        </Reveal>

        {members.length > 0 ? (
          <div className="mt-10 grid gap-10 sm:grid-cols-2">
            {members.map((person, i) => (
              <Reveal key={person.id} delay={i * 100} direction="up">
                {person.photo ? (
                  <img
                    src={getStorageUrl(person.photo)}
                    alt={person.name}
                    className="aspect-[4/5] w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="aspect-[4/5] w-full rounded-xl bg-concrete-100 flex items-center justify-center text-concrete-300">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="h-16 w-16">
                      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                  </div>
                )}
                <h3 className="mt-4 font-display text-xl font-bold tracking-tight text-ink">
                  {person.name}
                </h3>
                <p className="font-mono text-[11px] uppercase tracking-label text-brand-700">
                  {person.title}
                </p>
                {person.bio && (
                  <p className="mt-3 leading-relaxed text-concrete-500">{person.bio}</p>
                )}
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="mt-10 grid gap-10 sm:grid-cols-2">
            {["President", "Vice President"].map((title, i) => (
              <Reveal key={title} delay={i * 100} direction="up">
                <div className="aspect-[4/5] w-full rounded-xl bg-concrete-100 flex items-center justify-center text-concrete-300">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="h-16 w-16">
                    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                </div>
                <h3 className="mt-4 font-display text-xl font-bold tracking-tight text-concrete-300">—</h3>
                <p className="font-mono text-[11px] uppercase tracking-label text-concrete-300">{title}</p>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <section className="mt-20">
        <Reveal>
          <Eyebrow>Our team</Eyebrow>
          <h2 className="mt-4 max-w-2xl font-display text-3xl font-bold tracking-tight text-ink lg:text-4xl">
            Built by the people behind every project.
          </h2>
        </Reveal>
        <Reveal delay={100} direction="up">
          {teamPhoto ? (
            <img
              src={getStorageUrl(teamPhoto)}
              alt="The Pegah team"
              className="mt-10 aspect-[21/9] w-full rounded-xl object-cover"
            />
          ) : (
            <div className="mt-10 aspect-[21/9] w-full rounded-xl bg-concrete-100 flex items-center justify-center text-concrete-300">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="h-12 w-12">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          )}
        </Reveal>
      </section>
    </PageShell>
  );
}
