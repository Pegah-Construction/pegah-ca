"use client";

import { useState } from "react";
import { getStorageUrl } from "@/lib/storage-url";
import { SERVICE_SHAPE_CLASSES } from "@/lib/settings";

/**
 * Stock photography shipped with the site, one per default service (sources in
 * docs/SERVICE_PHOTO_CREDITS.md). Used when no photo has been uploaded, keyed by
 * slug rather than position so reordering the list can't shuffle the pictures
 * onto the wrong cards. These are generic stock, not Pegah's own projects — an
 * uploaded photo of real work always takes precedence.
 */
const BUNDLED_ART = new Set([
  "general-contracting",
  "project-management",
  "design-build",
  "care-support",
]);

/**
 * Square card image for a service. Services are edited as text lines, so the
 * image is optional and may point at a file that's since been removed — either
 * way this falls back to the bundled artwork, then to the striped placeholder,
 * rather than a broken image.
 */
export default function ServiceImage({
  src,
  title,
  index,
  slug,
  shape,
  zoom = true,
}: {
  src: string;
  title: string;
  index: number;
  slug?: string;
  shape?: string;
  zoom?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const aspect = SERVICE_SHAPE_CLASSES[shape ?? ""] ?? SERVICE_SHAPE_CLASSES.square;
  // An uploaded photo always wins; the bundled art only fills the gap.
  const url = getStorageUrl(src) || (slug && BUNDLED_ART.has(slug) ? `/services/${slug}.jpg` : "");

  return (
    <div className="overflow-hidden rounded-2xl border border-concrete-200 bg-concrete-100 shadow-sm">
      {!url || failed ? (
        // No photo yet: the card's number on the striped placeholder, rather
        // than repeating the title that already sits right below it.
        <div
          className={`image-slot flex ${aspect} items-center justify-center`}
          role="img"
          aria-label={`${title} — photo to come`}
        >
          <span className="select-none font-display text-5xl font-black text-concrete-300">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={title}
          onError={() => setFailed(true)}
          className={`${aspect} w-full object-cover ${zoom ? "transition-transform duration-500 group-hover:scale-[1.04]" : ""}`}
        />
      )}
    </div>
  );
}
