"use client";

import { useState } from "react";
import Link from "next/link";
import ImageSlot from "./ImageSlot";
import { sectors, projects } from "@/lib/site";

export default function ProjectFilter() {
  const [active, setActive] = useState("All");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"latest" | "oldest">("latest");
  const tabs = ["All", ...sectors];

  const needle = q.trim().toLowerCase();
  const visible = projects
    .filter((p) => active === "All" || p.sector === active)
    .filter(
      (p) =>
        !needle ||
        [p.name, p.location, p.sector, p.services].some((v) =>
          v.toLowerCase().includes(needle)
        )
    )
    .sort((a, b) =>
      sort === "latest" ? Number(b.year) - Number(a.year) : Number(a.year) - Number(b.year)
    );

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-concrete-400">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4-4" />
          </svg>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search projects…"
            className="w-full rounded-md border border-concrete-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-label text-concrete-500">Sort</span>
          {(["latest", "oldest"] as const).map((s) => {
            const on = s === sort;
            return (
              <button
                key={s}
                type="button"
                aria-pressed={on}
                onClick={() => setSort(s)}
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
      </div>

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
          {needle ? "No projects match your search." : "No projects in this sector yet."}
        </p>
      )}
    </>
  );
}
