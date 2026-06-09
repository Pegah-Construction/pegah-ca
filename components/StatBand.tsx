import Link from "next/link";
import { stats } from "@/lib/site";

export default function StatBand() {
  return (
    <section className="relative z-20 mx-auto -mt-16 max-w-8xl px-6 lg:px-10">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-concrete-200 bg-concrete-200 shadow-xl shadow-brand-900/10 md:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="flex flex-col items-center justify-center bg-paper px-6 py-8 text-center transition-colors hover:bg-brand-50"
          >
            <span className="font-display text-4xl font-black tracking-tight text-brand-800 lg:text-5xl">
              {s.value}
            </span>
            <span className="mt-2 font-mono text-[11px] uppercase tracking-label text-concrete-500">
              {s.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
