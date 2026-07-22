import { affiliations } from "@/lib/site";

// Scrolling strip of partner / affiliation logos, shown under the hero.
export default function PartnerStrip() {
  // Smartbid lives on the Tenders page only, not the home strip.
  const partners = affiliations.filter((a) => a.name !== "Smartbid");
  if (partners.length === 0) return null;
  // Duplicate the list so the marquee loops seamlessly.
  const items = [...partners, ...partners];

  return (
    <section className="overflow-hidden border-b border-concrete-200 bg-white py-8">
      <div className="marquee flex w-max items-center gap-16 pl-16">
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
