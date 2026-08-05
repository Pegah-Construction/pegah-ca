import { affiliations } from "@/lib/site";

// How many times the logo list is repeated in the track.
//
// The animation shifts the track by exactly one copy, so at the end of a cycle
// (COPIES - 1) copies are still to the right of the viewport's left edge. That
// remainder has to be at least as wide as the widest screen we support, or the
// strip visibly runs out of logos and leaves a blank gap before it restarts.
// One copy of the 9 logos is ~1637px, so 4 copies covers viewports up to
// ~4900px (4K and ultrawide). Two copies only covered ~1637px — narrower than a
// 1080p screen, which is what made the strip stutter.
const COPIES = 4;

// Scrolling strip of partner / affiliation logos, shown under the hero.
export default function PartnerStrip() {
  // Smartbid lives on the Tenders page only, not the home strip.
  const partners = affiliations.filter((a) => a.name !== "Smartbid");
  if (partners.length === 0) return null;
  // Repeat the list so the marquee loops seamlessly.
  const items = Array.from({ length: COPIES }, () => partners).flat();

  return (
    <section className="overflow-hidden border-b border-concrete-200 bg-surface py-8">
      {/* The shift must be exactly one copy of the list, hence -100%/COPIES.
          Passing it as a variable keeps it in step with COPIES above — see the
          .marquee keyframes in globals.css. The strip's pl-16 must also stay
          equal to its gap-16: the padding offsets the half-gap that the
          percentage shift would otherwise leave behind, which is what keeps the
          seam invisible. */}
      <div
        className="marquee flex w-max items-center gap-16 pl-16"
        style={{ "--marquee-shift": `${-100 / COPIES}%` } as React.CSSProperties}
      >
        {items.map((a, i) => (
          <a
            key={`${a.name}-${i}`}
            href={a.href}
            target="_blank"
            rel="noopener noreferrer"
            title={a.name}
            className="shrink-0 transition-opacity hover:opacity-100"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={a.logo}
              alt={a.name}
              className="h-10 w-auto max-w-[150px] object-contain"
            />
          </a>
        ))}
      </div>
    </section>
  );
}
