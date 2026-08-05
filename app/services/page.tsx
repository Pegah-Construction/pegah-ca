import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import Reveal from "@/components/Reveal";
import { getSiteSettings } from "@/lib/settings-server";
import { parseServices } from "@/lib/settings";

// Title and description follow the editable settings so the tab title and search
// snippet can't drift from the copy shown on the page.
export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return {
    title: s.servicesTitle,
    description: s.servicesIntro,
    alternates: { canonical: "/services" },
  };
}

export default async function ServicesPage() {
  const s = await getSiteSettings();
  const services = parseServices(s.servicesList);
  return (
    <PageShell
      eyebrow={s.servicesEyebrow}
      title={s.servicesTitle}
      intro={s.servicesIntro}
    >
      <div className="grid gap-px overflow-hidden rounded-xl border border-concrete-200 bg-concrete-200 sm:grid-cols-2">
        {services.map((s, i) => (
          <Reveal key={s.title} delay={i * 80} direction="up">
            <div id={s.slug} className="h-full bg-surface p-8">
              <span className="font-mono text-xs text-concrete-400">{i + 1}</span>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink">{s.title}</h2>
              <p className="mt-3 leading-relaxed text-concrete-500">{s.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </PageShell>
  );
}
