"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

export default function PhotoCarousel({
  photos,
  imgClassName,
  className,
  href,
  interval = 5000,
}: {
  photos: string[];
  imgClassName?: string;
  className?: string;
  href?: string;
  interval?: number;
}) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  // Bumped on every manual interaction so the autoplay timer restarts.
  const [tick, setTick] = useState(0);
  const count = photos.length;

  useEffect(() => {
    if (count <= 1 || paused) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % count), interval);
    return () => clearInterval(t);
  }, [count, paused, interval, tick]);

  const go = useCallback((next: (i: number) => number) => {
    setIdx((i) => (next(i) + count) % count);
    setTick((t) => t + 1);
  }, [count]);

  if (count === 0) return null;

  // Arrow / dot controls shouldn't trigger the surrounding image link.
  const stop = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); };

  const stack = (
    <div className={`relative w-full ${imgClassName ?? "aspect-[16/7]"}`}>
      {photos.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt=""
          aria-hidden={i !== idx}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            i === idx ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  );

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-concrete-100 ${className ?? ""}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {href ? <Link href={href} className="block">{stack}</Link> : stack}
      {count > 1 && (
        <>
          <button
            onClick={(e) => { stop(e); go((i) => i - 1); }}
            aria-label="Previous photo"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition hover:bg-black/60 sm:left-4 sm:p-2.5"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4 sm:h-5 sm:w-5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={(e) => { stop(e); go((i) => i + 1); }}
            aria-label="Next photo"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition hover:bg-black/60 sm:right-4 sm:p-2.5"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4 sm:h-5 sm:w-5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { stop(e); go(() => i); }}
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
