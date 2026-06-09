import Link from "next/link";

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
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={`eyebrow ${className}`}>{children}</p>;
}
