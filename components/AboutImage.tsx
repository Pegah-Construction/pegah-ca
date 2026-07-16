"use client";

import { useState } from "react";

/**
 * Shows /about.jpg (the "What we do" project rendering) once supplied; until
 * then renders a clean striped placeholder instead of a broken image.
 */
export default function AboutImage() {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className="image-slot flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl"
        role="img"
        aria-label="Project rendering"
      >
        <span className="rounded-md border border-concrete-300 bg-paper/90 px-3 py-1.5 font-mono text-[11px] tracking-wide text-concrete-500">
          Project rendering
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/about.jpg"
      alt="Pegah Construction project rendering"
      onError={() => setFailed(true)}
      className="aspect-[4/3] w-full rounded-2xl object-contain"
    />
  );
}
