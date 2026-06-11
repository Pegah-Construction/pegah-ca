import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import ImageSlot from "@/components/ImageSlot";
import { Eyebrow } from "@/components/Brand";
import { leadership } from "@/lib/site";

export const metadata: Metadata = { title: "About — Pegah Construction Ltd." };

export default function AboutPage() {
  return (
    <PageShell
      eyebrow="Our story"
      title="35+ years of quality workmanship."
      intro="Established in 1988, Pegah Construction Ltd. has built a solid reputation across Southern Ontario as an industrious, reliable team-player."
    >
      <p className="max-w-2xl text-lg leading-relaxed text-concrete-500">
        Content for the About page goes here — company history, the
        Design-Build approach, and the team behind the work.
      </p>

      <section className="mt-20">
        <Eyebrow>Leadership</Eyebrow>
        <h2 className="mt-4 max-w-2xl font-display text-3xl font-bold tracking-tight text-ink lg:text-4xl">
          The people guiding our work.
        </h2>
        <div className="mt-10 grid gap-10 sm:grid-cols-2">
          {leadership.map((person) => (
            <div key={person.name}>
              <ImageSlot
                label={`${person.title} photo`}
                className="aspect-[4/5] rounded-xl"
              />
              <h3 className="mt-4 font-display text-xl font-bold tracking-tight text-ink">
                {person.name}
              </h3>
              <p className="font-mono text-[11px] uppercase tracking-label text-brand-700">
                {person.title}
              </p>
              <p className="mt-3 leading-relaxed text-concrete-500">
                {person.bio}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <Eyebrow>Our team</Eyebrow>
        <h2 className="mt-4 max-w-2xl font-display text-3xl font-bold tracking-tight text-ink lg:text-4xl">
          Built by the people behind every project.
        </h2>
        <ImageSlot
          label="team photo"
          className="mt-10 aspect-[21/9] rounded-xl"
        />
      </section>
    </PageShell>
  );
}
