import Link from "next/link";

export function SiteLogo() {
  return (
    <Link href="/" className="inline-flex shrink-0 items-center">
      {/* eslint-disable-next-line @next/next/no-img-element -- local image, no optimization needed */}
      <img
        src="/logo.webp"
        alt="Pegah Construction Ltd., 35+ years"
        className="h-16 w-auto sm:h-[4.75rem] dark:hidden"
      />
      {/* White version for dark mode */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-dark.webp"
        alt="Pegah Construction Ltd., 35+ years"
        className="hidden h-16 w-auto sm:h-[4.75rem] dark:block"
      />
    </Link>
  );
}

/**
 * The Pegah logo for dark grounds — the admin sidebar and the login / password
 * brand panels, all of which are brand-900 navy in both themes.
 *
 * It uses the white artwork directly. The dark artwork on a white chip (what
 * this was) stayed legible once the rest of the UI went dark, but read as a
 * glaring white rectangle against it. No `dark:` variant is needed here, unlike
 * SiteLogo: the ground behind this one is navy in both themes.
 */
export function LogoMark({ href = "/", heightClass = "h-9" }: { href?: string; heightClass?: string }) {
  return (
    <Link href={href} className="inline-flex shrink-0 items-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-dark.webp"
        alt="Pegah Construction Ltd."
        className={`${heightClass} w-auto`}
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
