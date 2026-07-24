"use client";

import { useState } from "react";
import Link from "next/link";

export default function PhotoCarousel({ photos, imgClassName, className, href }: { photos: string[]; imgClassName?: string; className?: string; href?: string }) {
  const [idx, setIdx] = useState(0);
  if (photos.length === 0) return null;

  const prev = () => setIdx((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setIdx((i) => (i + 1) % photos.length);
  // Arrow / dot controls shouldn't trigger the surrounding image link.
  const stop = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); };

  const image = (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={photos[idx]}
      alt=""
      className={`${imgClassName ?? "aspect-[16/7]"} w-full object-cover`}
    />
  );

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-concrete-100 ${className ?? ""}`}>
      {href ? <Link href={href} className="block">{image}</Link> : image}
      {photos.length > 1 && (
        <>
          <button
            onClick={(e) => { stop(e); prev(); }}
            aria-label="Previous photo"
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/60"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={(e) => { stop(e); next(); }}
            aria-label="Next photo"
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/60"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { stop(e); setIdx(i); }}
                aria-label={`Photo ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === idx ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/75"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
