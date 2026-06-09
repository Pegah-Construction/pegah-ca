import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = { title: "About — Pegah Construction Ltd." };

export default function AboutPage() {
  return (
    <PageShell
      eyebrow="Our story"
      title="35+ years of quality workmanship."
      intro="Established in 1988, Pegah Construction Ltd. has built a solid reputation across Southern Ontario as an industrious, reliable team-player."
    >
      <p className="max-w-2xl text-lg leading-relaxed text-concrete-500">
        Content for the About page goes here — company history, leadership, the
        Design-Build approach, and the team behind the work.
      </p>
    </PageShell>
  );
}
