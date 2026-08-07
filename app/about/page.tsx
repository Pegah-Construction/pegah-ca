import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { Eyebrow } from "@/components/Brand";
import Reveal from "@/components/Reveal";
import FormatPartner from "@/components/FormatPartner";
import { db } from "@/lib/db";
import { getStorageUrl } from "@/lib/storage-url";
import { mergeAboutContent, toParagraphs, toLines } from "@/lib/about-content";
import { stats } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Pegah Construction Ltd. — an Ontario general contractor and project-management firm delivering ICI and residential projects since 1988.",
  alternates: { canonical: "/about" },
};

type Person = { id: string; name: string; title: string; bio: string; photo: string };

// One person, shown the same way in both the leadership and team sections.
function PersonCard({ person, delay }: { person: Person; delay: number }) {
  return (
    <Reveal delay={delay} direction="up">
      <div className="w-40 sm:w-48">
        {person.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={getStorageUrl(person.photo)}
            alt={person.name}
            className="aspect-[4/5] w-full rounded-xl object-cover"
          />
        ) : (
          <div className="flex aspect-[4/5] w-full items-center justify-center rounded-xl bg-concrete-100 text-concrete-300">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="h-10 w-10">
              <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </div>
        )}
        <h3 className="mt-3 font-display text-lg font-bold tracking-tight text-ink">{person.name}</h3>
        <p className="font-mono text-[11px] font-bold uppercase tracking-label text-accent-700">{person.title}</p>
        {person.bio && <p className="mt-2 text-sm leading-relaxed text-concrete-500">{person.bio}</p>}
      </div>
    </Reveal>
  );
}

export default async function AboutPage() {
  const [members, aboutRow, aboutImageRow] = await Promise.all([
    db.teamMember.findMany({ orderBy: { order: "asc" } }),
    db.setting.findUnique({ where: { key: "about_content" } }),
    db.setting.findUnique({ where: { key: "about_image" } }),
  ]);
  // Leadership and the wider team are the same records, split by their flag —
  // both render as individual cards, no group photo.
  const leaders = members.filter((m) => m.leadership);
  const team = members.filter((m) => !m.leadership);
  const content = mergeAboutContent(aboutRow?.value);
  const whatWeDoImg = aboutImageRow?.value ? getStorageUrl(aboutImageRow.value) : "/about.jpg";

  return (
    <PageShell eyebrow="Our story" title="About Us">
      <div className="mx-auto max-w-5xl space-y-14">
        {/* Stat strip */}
        <Reveal>
          <div className="grid grid-cols-2 gap-4 rounded-2xl border border-brand-100 bg-brand-50/50 p-6 sm:grid-cols-4 sm:p-8">
            {stats.map((st) => (
              <div key={st.label} className="text-center">
                <div className="font-display text-3xl font-black tracking-tight text-brand-700 lg:text-4xl">{st.value}</div>
                <div className="mt-1 font-mono text-[11px] uppercase tracking-label text-accent-700">{st.label}</div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Intro text with the image floated beside it (top-aligned; text wraps under it) */}
        <Reveal>
          <div className="flow-root">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={whatWeDoImg}
              alt="Pegah Construction project"
              className="mb-6 w-full rounded-2xl object-cover shadow-xl lg:float-right lg:mb-4 lg:ml-8 lg:w-[44%]"
            />
            <section>
              <div className="accent-bar mb-3" />
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink">Who we are</h2>
              <p className="mt-3 text-lg leading-relaxed text-concrete-600">{content.whoWeAre}</p>
            </section>
            <section className="mt-8">
              <div className="accent-bar mb-3" />
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink">Where we are</h2>
              <p className="mt-3 text-lg leading-relaxed text-concrete-600">{content.whereWeAre}</p>
            </section>
            <section className="mt-8">
              <div className="accent-bar mb-3" />
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink">What we do</h2>
              <div className="mt-3 space-y-4 text-lg leading-relaxed text-concrete-600">
                {toParagraphs(content.whatWeDo).map((para, i) => <p key={i}>{para}</p>)}
              </div>
            </section>
          </div>
        </Reveal>

        {/* Pegah Construction Ltd. will */}
        <Reveal>
          <section className="rounded-2xl border border-concrete-200 bg-surface p-7 shadow-sm sm:p-8">
            <div className="accent-bar mb-3" />
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink">Pegah Construction Ltd. will</h2>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2">
              {toLines(content.pegahWill).map((item) => (
                <li key={item} className="flex items-start gap-3 leading-relaxed text-concrete-600">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mt-0.5 h-5 w-5 shrink-0 text-brand-600">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>
      </div>

      {/* Leadership */}
      <section className="mx-auto mt-20 max-w-5xl">
        <Reveal>
          <div className="accent-bar mb-4" />
          <Eyebrow>Leadership</Eyebrow>
          <h2 className="mt-4 max-w-2xl font-display text-3xl font-bold tracking-tight text-ink lg:text-4xl">
            The people guiding our work.
          </h2>
        </Reveal>

        {leaders.length > 0 ? (
          <div className="mt-10 flex flex-wrap gap-10">
            {leaders.map((person, i) => (
              <PersonCard key={person.id} person={person} delay={i * 100} />
            ))}
          </div>
        ) : (
          <div className="mt-10 flex flex-wrap gap-10">
            {["President", "Vice President"].map((title, i) => (
              <Reveal key={title} delay={i * 100} direction="up">
                <div className="w-40 sm:w-48">
                  <div className="flex aspect-[4/5] w-full items-center justify-center rounded-xl bg-concrete-100 text-concrete-300">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="h-10 w-10">
                      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                  </div>
                  <h3 className="mt-3 font-display text-lg font-bold tracking-tight text-concrete-300">—</h3>
                  <p className="font-mono text-[11px] font-bold uppercase tracking-label text-accent-700">{title}</p>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* Our team */}
      <section className="mx-auto mt-20 max-w-5xl">
        <Reveal>
          <div className="accent-bar mb-4" />
          <Eyebrow>Our team</Eyebrow>
          <h2 className="mt-4 max-w-2xl font-display text-3xl font-bold tracking-tight text-ink lg:text-4xl">
            Built by the people behind every project.
          </h2>
        </Reveal>
        {team.length > 0 ? (
          <div className="mt-10 flex flex-wrap gap-10">
            {team.map((person, i) => (
              <PersonCard key={person.id} person={person} delay={i * 100} />
            ))}
          </div>
        ) : (
          <Reveal delay={100} direction="up">
            <p className="mt-8 text-concrete-400">Team members will appear here as they are added.</p>
          </Reveal>
        )}
      </section>

      {/* Closing + Format — last on the page */}
      <section className="mx-auto mt-20 max-w-5xl space-y-4 border-t border-concrete-200 pt-8">
        <Reveal>
          <p className="text-lg leading-relaxed text-concrete-500">{content.closing}</p>
          <FormatPartner className="mt-6" />
        </Reveal>
      </section>
    </PageShell>
  );
}
