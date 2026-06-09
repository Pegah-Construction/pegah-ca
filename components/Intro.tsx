import Link from "next/link";
import { Eyebrow } from "./Brand";

export default function Intro() {
  return (
    <section className="mx-auto max-w-8xl px-6 py-24 lg:px-10 lg:py-28">
      <Eyebrow>Who we are</Eyebrow>
      <div className="mt-6 grid gap-10 lg:grid-cols-12">
        <h2 className="font-display text-3xl font-bold leading-snug tracking-tight text-ink lg:col-span-8 lg:text-[2.6rem]">
          A general contractor and project-management firm trusted across
          commercial, industrial and institutional work in {""}
          <span className="text-brand-700">Southern Ontario</span>.
        </h2>
        <div className="lg:col-span-4">
          <p className="text-lg leading-relaxed text-concrete-500">
            From the first concept through to long-term care, we manage every
            stage — on time, on budget, and to the highest standard of
            workmanship.
          </p>
          <Link
            href="/about"
            className="mt-5 inline-flex font-display text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            Our story →
          </Link>
        </div>
      </div>
    </section>
  );
}
