import Link from "next/link";
import { Eyebrow } from "./Brand";
import Reveal from "./Reveal";
import { getSiteSettings } from "@/lib/settings-server";

export default async function Intro() {
  const s = await getSiteSettings();
  return (
    <section className="mx-auto max-w-8xl px-6 py-24 lg:px-10 lg:py-28">
      <Reveal>
        <Eyebrow>Who we are</Eyebrow>
      </Reveal>
      <div className="mt-6 grid gap-10 lg:grid-cols-12">
        <Reveal delay={100} direction="up" className="lg:col-span-8">
          <h2 className="font-display text-3xl font-bold leading-snug tracking-tight text-ink lg:text-[2.6rem]">
            {s.introHeading}
          </h2>
        </Reveal>
        <Reveal delay={220} direction="up" className="lg:col-span-4">
          <p className="text-lg leading-relaxed text-concrete-500">
            {s.introText}
          </p>
          <Link
            href="/about"
            className="mt-5 inline-flex font-display text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            Our story →
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
