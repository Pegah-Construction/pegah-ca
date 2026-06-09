import Link from "next/link";

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "solid" | "outline" | "ghost-light" | "white";
  className?: string;
};

const base =
  "inline-flex items-center gap-2 rounded-md px-5 py-3 font-display text-sm font-semibold tracking-wide transition-colors duration-200";

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  solid: "bg-brand-700 text-white hover:bg-brand-800",
  outline:
    "border border-ink/20 bg-transparent text-ink hover:border-ink/40 hover:bg-ink/5",
  "ghost-light":
    "border border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20",
  white: "bg-white text-brand-800 hover:bg-white/90",
};

export default function Button({
  href,
  children,
  variant = "solid",
  className = "",
}: ButtonProps) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}
