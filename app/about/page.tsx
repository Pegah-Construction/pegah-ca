import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { Eyebrow } from "@/components/Brand";
import Reveal from "@/components/Reveal";
import AboutImage from "@/components/AboutImage";
import { db } from "@/lib/db";
import { getStorageUrl } from "@/lib/storage-url";

export const metadata: Metadata = { title: "About Us — Pegah Construction Ltd." };

const WHAT_WE_DO = [
  "Pegah Construction Ltd. has long recognized the opportunities of the Design-Build process and, through targeted business planning, has been involved in a large number of projects delivered through the Design/Build, Design/Build/Finance/Operate, Design/Build/Maintain mechanisms. Our business strategy has been to accrue experience working both as the Owner's Consultant/Agent and also as the Design/Builder's Consultant.",
  "Working with our customers from the very start of their investment, we can help develop the initial concept, plan funding, and add value — from the initial concepts through to detailed designs. When it comes to delivering the asset, we can project manage the construction. We will be taking care of procurement and relationships with contractors as well as actual commissioning.",
  "Once the asset is commissioned, we offer long-term care and support services, from maintenance to specialist support services. Pegah Construction Ltd. will enhance your concepts, working with your design team to create exceptionally appealing and economical projects.",
  "Pegah Construction Ltd. is committed to excellence and specializes in custom work — performed to the highest quality workmanship. Pegah Construction Ltd. brings skills in project management, together with knowledge and experience in the processes of controlling and directing construction. Pegah Construction Ltd. will complete your project on time and on budget.",
];

const PEGAH_WILL = [
  'Be responsible for the site and will be "the Constructor" for the project.',
  "Prepare a detailed schedule for all trades involved and review that with you and your design team.",
  "Maintain and promote safety through enforcing Pegah's and local authorities' safety policies.",
  "Manage the project; review work of trades, coordinate shop drawings, arrange meetings, and prepare minutes of the meetings.",
];

export default async function AboutPage() {
  const [members, teamPhotoRow] = await Promise.all([
    db.teamMember.findMany({ orderBy: { order: "asc" } }),
    db.setting.findUnique({ where: { key: "team_photo" } }),
  ]);
  const teamPhoto = teamPhotoRow?.value ?? "";

  return (
    <PageShell eyebrow="Our story" title="About Us">
      <div className="max-w-5xl space-y-12">
        {/* Who we are */}
        <Reveal>
          <section>
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink">Who we are</h2>
            <p className="mt-3 text-lg leading-relaxed text-concrete-500">
              Established in 1988, Pegah Construction Ltd. is a general contracting and project management firm
              with years of experience in the Commercial, Industrial, Residential, Transportation, Recreational,
              Retail, and Historical Building sectors. Our staff has educational backgrounds in Civil Engineering,
              business administration, interior decoration, electrical technology, carpentry, and computer graphics.
              They are familiar with all industry-standard construction and administration computer programs.
            </p>
          </section>
        </Reveal>

        {/* Where we are */}
        <Reveal>
          <section>
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink">Where we are</h2>
            <p className="mt-3 text-lg leading-relaxed text-concrete-500">
              Pegah Construction Ltd. has been active in Ontario and has gained a solid reputation for providing
              quality workmanship and being an industrious team-player.
            </p>
          </section>
        </Reveal>

        {/* What we do — rendering + text */}
        <Reveal>
          <section className="grid gap-8 lg:grid-cols-2 lg:items-start">
            <AboutImage />
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink">What we do</h2>
              <div className="mt-3 space-y-4 text-lg leading-relaxed text-concrete-500">
                {WHAT_WE_DO.map((para, i) => <p key={i}>{para}</p>)}
              </div>
            </div>
          </section>
        </Reveal>

        {/* Pegah Construction Ltd. will */}
        <Reveal>
          <section>
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink">Pegah Construction Ltd. will</h2>
            <ul className="mt-4 space-y-2.5">
              {PEGAH_WILL.map((item) => (
                <li key={item} className="flex items-start gap-3 text-lg leading-relaxed text-concrete-500">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>

      </div>

      {/* Leadership */}
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

      {/* Our team */}
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

      {/* Closing + Format — last on the page */}
      <section className="mt-20 max-w-5xl space-y-4 border-t border-concrete-200 pt-8">
        <Reveal>
          <p className="text-lg leading-relaxed text-concrete-500">
            Rely on Pegah Construction Ltd. years of construction experience, agility, reliability, dedication,
            service, and quality workmanship.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-concrete-500">For our development projects please visit:</p>
          <a href="https://www.formatgroup.ca" target="_blank" rel="noopener noreferrer" className="mt-4 inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/format-logo.svg" alt="Format Group" className="h-14 w-auto" />
          </a>
          <a href="https://www.formatgroup.ca" target="_blank" rel="noopener noreferrer" className="mt-2 block font-mono text-sm text-brand-700 underline underline-offset-2 hover:text-brand-800">
            www.formatgroup.ca
          </a>
        </Reveal>
      </section>
    </PageShell>
  );
}
