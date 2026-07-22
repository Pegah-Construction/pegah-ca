// "In partnership with our development company" + FORMAT logo lockup.
// Shared by the Residential projects section and the About page so they match.
export default function FormatPartner({ className = "" }: { className?: string }) {
  return (
    <a
      href="https://www.formatgroup.ca"
      target="_blank"
      rel="noopener noreferrer"
      title="Format Group"
      className={`inline-flex items-end gap-5 transition-opacity hover:opacity-80 ${className}`}
    >
      <span className="max-w-[12rem] text-left font-display text-sm font-semibold uppercase leading-relaxed tracking-wide text-[#5f5f74]">
        In partnership with our development company
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/format-group.svg" alt="Format Group" className="h-14 w-auto object-contain sm:h-20" />
    </a>
  );
}
