"use client";

import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
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
  value: number;
  photos: string[];
};

type FilterKey = "All Projects" | "ICI" | "Residential";
const FILTERS: FilterKey[] = ["All Projects", "ICI", "Residential"];

// The two portfolio groups. "ICI" (Institutional, Commercial & Industrial)
// covers everything that isn't residential.
const SECTIONS: {
  key: Exclude<FilterKey, "All Projects">;
  heading: string;
  intro: string;
  logo?: string;
  match: (p: PublicProject) => boolean;
}[] = [
  {
    key: "ICI",
    heading: "ICI Projects",
    intro: "Explore our institutional, commercial, and industrial construction projects, delivered to the highest standards across Ontario.",
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

// The sort control. "Newest" is the default view: the portfolio should open on
// the most recent work, not at whatever the alphabet gives.
const SORTS = [
  { value: "completed-desc", label: "Newest" },
  { value: "completed-asc", label: "Oldest" },
  { value: "name-asc", label: "Name (A–Z)" },
  { value: "value-asc", label: "Value (min → max)" },
];
const DEFAULT_SORT = "completed-desc";

// `dateCompleted` is a year the editor types ("2019"), but a few imported rows
// carry "2019-01". Read the leading year as a number so the two forms compare
// the same and anything unparseable counts as undated.
const yearOf = (p: PublicProject) => {
  const y = parseInt(p.dateCompleted.slice(0, 4), 10);
  return Number.isFinite(y) ? y : 0;
};

// Ties fall back to name order, so every sort has one predictable result rather
// than leaving same-year (or same-value) projects in whatever order they came.
const byName = (a: PublicProject, b: PublicProject) => a.name.localeCompare(b.name);

function ProjectCard({ p, i, href }: { p: PublicProject; i: number; href: string }) {
  return (
    <Reveal delay={(i % 3) * 80} direction="up">
      <div className="group">
        {p.photos.length > 1 ? (
          <PhotoCarousel photos={p.photos} imgClassName="aspect-[4/3]" className="img-card" href={href} />
        ) : p.photos.length === 1 ? (
          <Link href={href} className="img-card block aspect-[4/3] rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.photos[0]} alt={p.name} className="h-full w-full object-cover" />
          </Link>
        ) : (
          <Link href={href} className="block">
            <div className="img-card aspect-[4/3] rounded-xl bg-concrete-100" />
          </Link>
        )}
        {(p.type || p.category) && (
          <span className="mt-3 inline-flex rounded-full bg-brand-50 px-3 py-1 font-mono text-[11px] uppercase tracking-label text-accent-700">
            {p.type || p.category}
          </span>
        )}
        <h3 className="mt-2 font-display text-lg font-bold tracking-tight text-ink group-hover:text-brand-700">
          <Link href={href} className="hover:text-brand-700">{p.name}</Link>
        </h3>
        {/* Location and year — the year also makes the date sorts readable. */}
        {(p.location || yearOf(p)) && (
          <p className="mt-0.5 font-mono text-[11px] text-concrete-400">
            {[p.location, yearOf(p) || null].filter(Boolean).join(" · ")}
          </p>
        )}
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
        className="cursor-pointer appearance-none rounded-md border border-concrete-300 bg-surface py-2.5 pl-3 pr-9 text-sm text-ink outline-none focus:border-brand-500"
      >
        {children}
      </select>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-concrete-400">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}

export default function ProjectFilter({ projects }: { projects: PublicProject[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const catParam = searchParams.get("category");
  const initialFilter: FilterKey =
    catParam === "ICI" ? "ICI" : catParam === "Residential" ? "Residential" : "All Projects";

  // Every control seeds itself from the URL, so opening a project and coming
  // back — or reloading, or sharing the link — lands on the same view.
  const [filter, setFilter] = useState<FilterKey>(initialFilter);
  const [subType, setSubType] = useState(() => searchParams.get("type") ?? "All");

  // Sync the active filter when the ?category= param changes (e.g. via the navbar dropdown).
  useEffect(() => { setFilter(initialFilter); }, [initialFilter]);
  const [q, setQ] = useState(() => searchParams.get("q") ?? "");
  const [sort, setSort] = useState(() => {
    const fromUrl = searchParams.get("sort");
    return SORTS.some((o) => o.value === fromUrl) ? (fromUrl as string) : DEFAULT_SORT;
  });

  // The whole view in one query string.
  const params = new URLSearchParams();
  if (filter !== "All Projects") params.set("category", filter);
  if (subType !== "All") params.set("type", subType);
  if (q) params.set("q", q);
  if (sort !== DEFAULT_SORT) params.set("sort", sort);
  const query = params.toString();

  // Mirror the controls back into the URL. The native history API is used
  // rather than router.replace so a keystroke only rewrites the address bar —
  // no navigation, no refetch of the project list — while still leaving the
  // browser a history entry that restores this exact view on Back.
  useEffect(() => {
    const url = query ? `${pathname}?${query}` : pathname;
    if (url !== window.location.pathname + window.location.search) {
      window.history.replaceState(null, "", url);
    }
  }, [query, pathname]);

  // …and hand it to the project links, so the detail page's own "back to all
  // projects" returns to this view too, not just the browser's Back button.
  const hrefFor = (p: PublicProject) =>
    query ? `/projects/${p.id}?back=${encodeURIComponent(query)}` : `/projects/${p.id}`;

  // Purpose types present among commercial (non-residential) projects.
  const purposeTypes = Array.from(
    new Set(projects.filter((p) => p.category !== "Residential").map((p) => p.type).filter(Boolean))
  ).sort();

  const needle = q.trim().toLowerCase();
  const matchesSearch = (p: PublicProject) =>
    !needle || [p.name, p.location, p.type, p.category].some((v) => v.toLowerCase().includes(needle));
  const hasQuery = !!needle;

  const sortItems = (arr: PublicProject[]) => {
    return [...arr].sort((a, b) => {
      if (sort === "name-asc") return byName(a, b);
      if (sort === "value-asc") {
        // Projects with no value recorded go to the bottom, rather than opening
        // a min → max list with a run of blanks.
        if (!a.value !== !b.value) return a.value ? -1 : 1;
        return a.value - b.value || byName(a, b);
      }
      const ay = yearOf(a);
      const by = yearOf(b);
      // Likewise, undated projects sort last whichever direction is picked.
      if (!ay || !by) return !ay && !by ? byName(a, b) : ay ? -1 : 1;
      return (sort === "completed-asc" ? ay - by : by - ay) || byName(a, b);
    });
  };

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
                    on ? "border-ink bg-ink text-paper" : "border-ink text-ink hover:bg-ink hover:text-paper"
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
              className="w-full rounded-md border border-concrete-300 bg-surface py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ControlSelect value={sort} onChange={setSort}>
              {SORTS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </ControlSelect>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-8xl space-y-16 px-6 py-16 lg:px-10">
        {filter === "All Projects" ? (
          (() => {
            const items = sortItems(projects.filter(matchesSearch));
            return items.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((p, i) => (
                  <ProjectCard key={p.id} p={p} i={i} href={hrefFor(p)} />
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
          const isCommercial = section.key === "ICI";
          let items = projects.filter(section.match).filter(matchesSearch);
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
                        {t === "All" ? "All ICI" : t}
                      </button>
                    );
                  })}
                </div>
              )}

              {items.length > 0 ? (
                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((p, i) => (
                    <ProjectCard key={p.id} p={p} i={i} href={hrefFor(p)} />
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
