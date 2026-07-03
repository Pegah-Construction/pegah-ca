"use client";

import { useState } from "react";
import Link from "next/link";
import PhotoCarousel from "./PhotoCarousel";
import Reveal from "./Reveal";

export type PublicProject = {
  id: string;
  name: string;
  location: string;
  category: string;
  type: string;
  dateCompleted: string;
  photos: string[];
};

const TABS = ["All", "Commercial", "Residential"];
const PURPOSE_TYPES = ["Education", "Emergency Services", "Retail", "Recreation", "Transportation"];

export default function ProjectFilter({ projects }: { projects: PublicProject[] }) {
  const [category, setCategory] = useState("All");
  const [subType, setSubType] = useState("All");
  const [q, setQ] = useState("");

  const handleCategoryChange = (c: string) => { setCategory(c); setSubType("All"); };

  const needle = q.trim().toLowerCase();
  const visible = projects
    .filter((p) => category === "All" || p.category === category)
    .filter((p) => subType === "All" || p.type === subType)
    .filter((p) => !needle || [p.name, p.location, p.type, p.category].some((v) => v.toLowerCase().includes(needle)));

  return (
    <>
      {/* Search + category tabs */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-concrete-400">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4-4" />
          </svg>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search projects…"
            className="w-full rounded-md border border-concrete-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500"
          />
        </div>
        <div className="flex flex-wrap gap-1 rounded-lg border border-concrete-200 bg-concrete-50 p-1">
          {TABS.map((c) => (
            <button key={c} type="button" onClick={() => handleCategoryChange(c)}
              className={`rounded-md px-4 py-1.5 font-display text-sm font-semibold transition-colors ${category === c ? "bg-white text-ink shadow-sm" : "text-concrete-500 hover:text-ink"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-type chips */}
      {category === "Commercial" && (
        <div className="mb-8 flex flex-wrap gap-2">
          <button type="button" onClick={() => setSubType("All")}
            className={`rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-label transition-colors ${subType === "All" ? "bg-brand-700 text-white" : "border border-concrete-300 text-concrete-500 hover:border-brand-400 hover:text-brand-700"}`}>
            All Commercial
          </button>
          {PURPOSE_TYPES.map((t) => (
            <button key={t} type="button" onClick={() => setSubType(t)}
              className={`rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-label transition-colors ${subType === t ? "bg-brand-700 text-white" : "border border-concrete-300 text-concrete-500 hover:border-brand-400 hover:text-brand-700"}`}>
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Project grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((p, i) => (
          <Reveal key={p.id} delay={(i % 3) * 80} direction="up">
            <div className="group">
              {p.photos.length > 1 ? (
                <PhotoCarousel photos={p.photos} imgClassName="aspect-[4/3]" className="img-card" />
              ) : p.photos.length === 1 ? (
                <Link href={`/projects/${p.id}`} className="block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.photos[0]} alt={p.name}
                    className="img-card aspect-[4/3] w-full rounded-xl object-cover" />
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
              {p.location && (
                <p className="mt-0.5 font-mono text-[11px] text-concrete-400">{p.location}</p>
              )}
            </div>
          </Reveal>
        ))}
      </div>

      {visible.length === 0 && (
        <p className="py-16 text-center font-body text-lg text-concrete-400">
          {needle ? "No projects match your search." : "No projects in this category yet."}
        </p>
      )}
    </>
  );
}
