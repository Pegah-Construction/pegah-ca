"use client";

import { useState } from "react";

/**
 * Renders an affiliation/partner logo. If the image file hasn't been supplied
 * yet (or fails to load), it falls back to a clean text badge so the section
 * never shows a broken image.
 */
export default function AffiliationLogo({
  name,
  logo,
  grayscale = false,
}: {
  name: string;
  logo: string;
  /** Show the logo desaturated until hovered (used on the Tenders page). */
  grayscale?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className="font-display text-base font-semibold text-concrete-500 transition-colors group-hover:text-brand-700">
        {name}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logo}
      alt={name}
      onError={() => setFailed(true)}
      className={
        grayscale
          ? "h-10 w-auto max-w-[140px] object-contain opacity-70 grayscale transition-all group-hover:opacity-100 group-hover:grayscale-0"
          : "h-9 w-auto max-w-[130px] object-contain"
      }
    />
  );
}
