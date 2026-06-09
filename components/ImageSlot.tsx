type ImageSlotProps = {
  label: string;
  className?: string;
  dark?: boolean;
};

/**
 * Striped placeholder standing in for real photography.
 * Replace these with <Image /> from "next/image" once assets are supplied.
 */
export default function ImageSlot({
  label,
  className = "",
  dark = false,
}: ImageSlotProps) {
  return (
    <div
      className={`image-slot relative flex items-center justify-center overflow-hidden ${
        dark ? "image-slot--dark" : ""
      } ${className}`}
      role="img"
      aria-label={`Placeholder: ${label}`}
    >
      <span
        className={`pointer-events-none select-none rounded-md border px-3 py-1.5 font-mono text-[11px] tracking-wide ${
          dark
            ? "border-white/25 bg-black/30 text-white/80"
            : "border-concrete-300 bg-paper/90 text-concrete-500"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
