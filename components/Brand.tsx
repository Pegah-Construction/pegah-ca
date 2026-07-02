import Link from "next/link";

export function SiteLogo() {
  return (
    <Link href="/" className="inline-flex shrink-0 items-center">
      {/* eslint-disable-next-line @next/next/no-img-element -- local SVG, no optimization needed */}
      <img
        src="/logo.webp"
        alt="Pegah Construction Ltd. — 35+ years"
        className="h-10 w-auto sm:h-12"
      />
    </Link>
  );
}

export function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2">
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-[7px] font-display text-lg font-black ${
          light ? "bg-white text-brand-800" : "bg-brand-700 text-white"
        }`}
      >
        P
      </span>
      <span
        className={`font-display text-lg font-extrabold tracking-tight ${
          light ? "text-white" : "text-ink"
        }`}
      >
        PEGAH
        <span className="text-brand-500"> Construction</span>
      </span>
    </Link>
  );
}

export function Eyebrow({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return <p className={`eyebrow ${className}`} style={style}>{children}</p>;
}
