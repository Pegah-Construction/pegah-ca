"use client";

import { useState } from "react";
import Link from "next/link";
import PhotoCarousel from "./PhotoCarousel";
import Reveal from "./Reveal";
import FormatPartner from "./FormatPartner";

export type PublicProject = {
  id: string;
  name: string;
  location: string;
  category: string;
  type: string;
  dateCompleted: string;
  photos: string[];
};

type FilterKey = "All Projects" | "Commercial" | "Residential";
const FILTERS: FilterKey[] = ["All Projects", "Commercial", "Residential"];

// The two portfolio groups. "Commercial" covers commercial / industrial /
// institutional work (everything that isn't residential).
const SECTIONS: {
  key: Exclude<FilterKey, "All Projects">;
  heading: string;
  intro: string;
  logo?: string;
  match: (p: PublicProject) => boolean;
}[] = [
  {
    key: "Commercial",
    heading: "Commercial Projects",
    intro: "Explore our commercial, industrial, and institutional construction projects, delivered to the highest standards across Ontario.",
    match: (p) => p.category !== "Residential",
  },
  {
    key: "Residential",
    heading: "Residential Projects",
    intro: "Discover our residential construction and development projects, built with quality workmanship and attention to detail.",
    logo: "/format-group.svg",
    match: (p) => p.category === "Residential",
  },
];

function ProjectCard({ p, i }: { p: PublicProject; i: number }) {
  return (
    <Reveal delay={(i % 3) * 80} direction="up">
      <div className="group">
        {p.photos.length > 1 ? (
          <PhotoCarousel photos={p.photos} imgClassName="aspect-[4/3]" className="img-card" />
        ) : p.photos.length === 1 ? (
          <Link href={`/projects/${p.id}`} className="block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.photos[0]} alt={p.name} className="img-card aspect-[4/3] w-full rounded-xl object-cover" />
          </Link>
        ) : (
          <Link href={`/projects/${p.id}`} className="block">
            <div className="img-card aspect-[4/3] rounded-xl bg-concrete-100" />
          </Link>
        )}
        <div className="mt-3 flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-bold tracking-tight text-ink group-hover:text-brand-700">
            <Link href={`/projects/${p.id}`} className="hover:text-brand-700">{p.name}</Link>
          </h3>
          {p.type && (
            <span className="mt-1 shrink-0 font-mono text-[11px] uppercase tracking-label text-brand-700">{p.type}</span>
          )}
        </div>
        {p.location && <p className="mt-0.5 font-mono text-[11px] text-concrete-400">{p.location}</p>}
      </div>
    </Reveal>
  );
}

function ControlSelect({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer appearance-none rounded-md border border-concrete-300 bg-white py-2.5 pl-3 pr-9 text-sm text-ink outline-none focus:border-brand-500"
      >
        {children}
      </select>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-concrete-400">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}

const yearOf = (p: PublicProject) => (p.dateCompleted ? p.dateCompleted.slice(0, 4) : "");

export default function ProjectFilter({ projects }: { projects: PublicProject[] }) {
  const [filter, setFilter] = useState<FilterKey>("All Projects");
  const [subType, setSubType] = useState("All");
  const [q, setQ] = useState("");
  const [year, setYear] = useState("All");
  const [sort, setSort] = useState("completed-desc");

  // Purpose types present among commercial (non-residential) projects.
  const purposeTypes = Array.from(
    new Set(projects.filter((p) => p.category !== "Residential").map((p) => p.type).filter(Boolean))
  ).sort();

  const yearOptions = Array.from(new Set(projects.map(yearOf).filter(Boolean))).sort((a, b) => b.localeCompare(a));

  const needle = q.trim().toLowerCase();
  const matchesSearch = (p: PublicProject) =>
    !needle || [p.name, p.location, p.type, p.category].some((v) => v.toLowerCase().includes(needle));
  const matchesYear = (p: PublicProject) => year === "All" || yearOf(p) === year;
  const hasQuery = !!needle || year !== "All";

  const sortItems = (arr: PublicProject[]) =>
    [...arr].sort((a, b) => {
      if (sort === "name-asc") return a.name.localeCompare(b.name);
      const av = yearOf(a);
      const bv = yearOf(b);
      if (!av && !bv) return 0;
      if (!av) return 1; // no completion date sorts last
      if (!bv) return -1;
      return sort === "completed-asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  return (
    <>
      {/* Hero: title, intro, category filters */}
      <section className="hero-surface border-b border-concrete-200 pt-32">
        <div className="mx-auto max-w-8xl px-6 pb-12 lg:px-10">
          <div className="accent-bar hero-animate mb-5" style={{ animationDelay: "0ms" }} />
          <h1 className="hero-animate font-display text-4xl font-black tracking-tight text-ink lg:text-6xl" style={{ animationDelay: "60ms" }}>
            All Projects
          </h1>
          <p className="hero-animate mt-5 max-w-2xl text-lg leading-relaxed text-concrete-500" style={{ animationDelay: "120ms" }}>
            Explore our complete portfolio of commercial, industrial, institutional, and residential
            construction projects across Ontario.
          </p>
          <div className="hero-animate mt-8 flex flex-wrap gap-3" style={{ animationDelay: "240ms" }}>
            {FILTERS.map((f) => {
              const on = filter === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => { setFilter(f); setSubType("All"); }}
                  className={`rounded-md border-2 px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-label transition-colors ${
                    on ? "border-ink bg-ink text-white" : "border-ink text-ink hover:bg-ink hover:text-white"
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Search band */}
      <div className="border-b border-concrete-200 bg-concrete-100">
        <div className="mx-auto flex max-w-8xl flex-col gap-3 px-6 py-6 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <div className="relative w-full sm:max-w-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-concrete-400">
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
          <div className="flex flex-wrap items-center gap-2">
            <ControlSelect value={year} onChange={setYear}>
              <option value="All">All years</option>
              {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
            </ControlSelect>
            <ControlSelect value={sort} onChange={setSort}>
              <option value="completed-desc">Newest first</option>
              <option value="completed-asc">Oldest first</option>
              <option value="name-asc">Name (A–Z)</option>
            </ControlSelect>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-8xl space-y-16 px-6 py-16 lg:px-10">
        {filter === "All Projects" ? (
          (() => {
            const items = sortItems(projects.filter(matchesSearch).filter(matchesYear));
            return items.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((p, i) => (
                  <ProjectCard key={p.id} p={p} i={i} />
                ))}
              </div>
            ) : (
              <p className="font-body text-concrete-400">
                {hasQuery ? "No projects match your filters." : "No projects yet."}
              </p>
            );
          })()
        ) : (
          SECTIONS.filter((s) => s.key === filter).map((section) => {
          const isCommercial = section.key === "Commercial";
          let items = projects.filter(section.match).filter(matchesSearch).filter(matchesYear);
          if (isCommercial && subType !== "All") items = items.filter((p) => p.type === subType);
          items = sortItems(items);
          return (
            <section key={section.key}>
              <Reveal>
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                  <div className="min-w-0">
                    <h2 className="font-display text-3xl font-black tracking-tight text-ink lg:text-4xl">{section.heading}</h2>
                    <p className="mt-2 max-w-2xl text-lg leading-relaxed text-concrete-500">{section.intro}</p>
                  </div>
                  {section.logo && <FormatPartner className="shrink-0 sm:mt-1" />}
                </div>
              </Reveal>

              {/* Purpose-type sub-filters (commercial only) */}
              {isCommercial && purposeTypes.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {["All", ...purposeTypes].map((t) => {
                    const on = subType === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSubType(t)}
                        className={`rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-label transition-colors ${
                          on ? "bg-brand-700 text-white" : "border border-concrete-300 text-concrete-500 hover:border-brand-400 hover:text-brand-700"
                        }`}
                      >
                        {t === "All" ? "All Commercial" : t}
                      </button>
                    );
                  })}
                </div>
              )}

              {items.length > 0 ? (
                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((p, i) => (
                    <ProjectCard key={p.id} p={p} i={i} />
                  ))}
                </div>
              ) : (
                <p className="mt-6 font-body text-concrete-400">
                  {hasQuery ? "No projects match your filters." : "No projects in this category yet."}
                </p>
              )}
            </section>
          );
          })
        )}
      </div>
    </>
  );
}
