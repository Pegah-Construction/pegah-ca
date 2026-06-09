"use client";

import { useState } from "react";
import Link from "next/link";
import ImageSlot from "./ImageSlot";
import { sectors, projects } from "@/lib/site";

export default function ProjectFilter() {
  const [active, setActive] = useState("All");
  const tabs = ["All", ...sectors];
  const visible = projects.filter(
    (p) => active === "All" || p.sector === active
  );

  return (
    <>
      <div className="mb-10 flex flex-wrap gap-2">
        {tabs.map((s) => {
          const on = s === active;
          return (
            <button
              key={s}
              type="button"
              aria-pressed={on}
              onClick={() => setActive(s)}
              className={`rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-label transition-colors ${
                on
                  ? "bg-brand-700 text-white"
                  : "border border-concrete-300 text-concrete-500 hover:border-brand-400 hover:text-brand-700"
              }`}
            >
              {s}
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((p) => (
          <Link key={p.slug} href={`/projects/${p.slug}`} className="group">
            <ImageSlot
              label="project photo"
              className="aspect-[4/3] rounded-xl transition-opacity group-hover:opacity-90"
            />
            <div className="mt-3 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold tracking-tight text-ink group-hover:text-brand-700">
                {p.name}
              </h3>
              <span className="font-mono text-[11px] uppercase tracking-label text-brand-700">
                {p.sector}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {visible.length === 0 && (
        <p className="py-16 text-center font-body text-lg text-concrete-400">
          No projects in this sector yet.
        </p>
      )}
    </>
  );
}
