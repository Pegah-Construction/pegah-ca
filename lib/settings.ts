// Editable org / contact settings, stored in the Setting key/value table and
// managed from the admin Settings page. These defaults are used until edited.

export const SETTINGS_DEFAULTS: Record<string, string> = {
  companyName: "Pegah Construction Ltd.",
  phone: "(416) 739-9300",
  email: "info@pegah.ca",
  estimatingEmail: "estimating@pegah.ca",
  addressLine1: "5050 Dufferin Street, Suite 120",
  addressLine2: "Toronto, Ontario M3H 5T5",
  contactTitle: "How can we help?",
  contactIntro:
    "Whether it's a new project, a tender, a careers enquiry or a general question, send us a note and we'll get it to the right person.",
  // Home / landing page
  heroEyebrow: "Established 1988",
  heroTitle: "Building Excellence",
  heroSubtitle: "General Contracting & Project Management serving Ontario since 1988",
  introHeading:
    "A general contractor and project-management firm trusted across commercial, industrial and institutional work in Ontario.",
  introText:
    "From the first concept through to long-term care, we manage every stage, on time, on budget, and to the highest standard of workmanship.",
  // The services section on the home page (there is no separate services page —
  // the section is the whole of it).
  servicesEyebrow: "What we do",
  // {count} is replaced with the number of services actually in the list below,
  // so the heading can't go stale when a service is added or removed.
  servicesHomeHeading: "{count} ways we deliver your project.",
  servicesIntro:
    "Pegah is a full-service construction firm delivering general contracting, project management and design–build across commercial, industrial and institutional work. From initial concept through to long-term care, we manage every stage of delivery.",
  servicesList: [
    "General Contracting | Responsible for the site as the Constructor: trades, schedule and delivery.",
    "Project Management | Procurement, contractor relationships, coordination and commissioning.",
    "Design–Build | One accountable team from initial concept through detailed design and build.",
    "Care & Support | Long-term maintenance and specialist support once the asset is live.",
  ].join("\n"),
  // How the services section is laid out. The copy and the number of services
  // are both editable, so these stop the presentation from being pinned to
  // choices that only ever suited exactly four cards.
  servicesVisible: "1",
  servicesColumns: "2",
  servicesImageShape: "square",
  servicesBackground: "tint",
  servicesSpacing: "normal",
  servicesHeadingSize: "medium",
  servicesAlign: "left",
  servicesAccentBar: "1",
  servicesAnimate: "1",
  servicesImageZoom: "1",
};

// Settings are stored as strings; treat anything but an explicit "off" as on,
// so a key that has never been saved still shows.
export const isOn = (v: string | undefined) =>
  v !== "0" && v !== "false" && v !== "";

/**
 * Per-card width, as a flex basis rather than grid columns.
 *
 * A grid of `1fr` tracks cannot centre an incomplete last row — five cards in
 * fours leaves the fifth hugging the left edge. Wrapping flex with an exact
 * basis lays complete rows out identically to the old grid while letting
 * `justify-center` centre whatever is left over.
 *
 * The bases subtract their share of the gutters, which widen from 4rem
 * (gap-x-16) to 6rem (lg:gap-x-24) on a large screen. Two across on a tablet is
 * 50% minus one 4rem gutter split over two cards (2rem each); at lg the same
 * gutter is 6rem, so two across is 50% minus 3rem, three across is 33.333%
 * minus two gutters over three cards (4rem) and four across is 25% minus three
 * over four (4.5rem). Change either gap in ServicesList and these have to
 * change with it, or a row overflows and wraps a card early.
 *
 * Tailwind only generates classes it can see written out, so a stored value
 * like "3" can never be interpolated — it has to select a literal. Phones
 * always get one card per row.
 */
export const SERVICE_CARD_WIDTH_CLASSES: Record<string, string> = {
  "1": "basis-full",
  "2": "basis-full sm:basis-[calc(50%_-_2rem)] lg:basis-[calc(50%_-_3rem)]",
  "3": "basis-full sm:basis-[calc(50%_-_2rem)] lg:basis-[calc(33.333%_-_4rem)]",
  "4": "basis-full sm:basis-[calc(50%_-_2rem)] lg:basis-[calc(25%_-_4.5rem)]",
};

export const SERVICE_SHAPE_CLASSES: Record<string, string> = {
  square: "aspect-square",
  landscape: "aspect-[4/3]",
  wide: "aspect-[16/9]",
  portrait: "aspect-[3/4]",
};

export const SERVICE_BACKGROUND_CLASSES: Record<string, string> = {
  tint: "tint-grid-surface",
  surface: "bg-surface",
  paper: "bg-paper",
  brand: "bg-brand-50",
};

export const SERVICE_SPACING_CLASSES: Record<string, string> = {
  compact: "py-10 sm:py-14 lg:py-16",
  normal: "py-16 sm:py-24 lg:py-28",
  roomy: "py-24 sm:py-32 lg:py-40",
};

export const SERVICE_HEADING_CLASSES: Record<string, string> = {
  small: "text-2xl lg:text-3xl",
  medium: "text-3xl lg:text-4xl",
  large: "text-4xl lg:text-5xl",
};

/** Left or centred header block. Each piece needs its own literal classes. */
export const SERVICE_ALIGN_CLASSES: Record<string, { text: string; block: string; bar: string }> = {
  left: { text: "", block: "max-w-3xl", bar: "" },
  center: { text: "text-center", block: "mx-auto max-w-3xl", bar: "mx-auto" },
};

// Keys editable via /api/settings.
export const SETTINGS_KEYS = Object.keys(SETTINGS_DEFAULTS);

// Build a tel: href from a display phone string.
export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const NUMBER_WORDS = [
  "zero", "one", "two", "three", "four", "five", "six",
  "seven", "eight", "nine", "ten", "eleven", "twelve",
];

// Spelled-out count, falling back to digits past the words we have.
const numberWord = (n: number) => NUMBER_WORDS[n] ?? String(n);

/**
 * Fill the count placeholders in an editable heading:
 *   {count} → spelled out ("four"), capitalised when it opens the sentence
 *   {n}     → digits ("4")
 * Headings that use neither token are returned untouched, so an editor can
 * always just write plain copy.
 */
export function fillCount(template: string, count: number): string {
  return template
    .replace(/\{count\}/g, (_m, at: number) => {
      const word = numberWord(count);
      // Only capitalise when the token starts the string — mid-sentence reads
      // better lowercase ("we offer four ways", not "we offer Four ways").
      return at === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word;
    })
    .replace(/\{n\}/g, String(count));
}

export type ParsedService = { title: string; desc: string; image: string; slug: string };

/**
 * A trailing third field is only read as a card image when it actually looks
 * like one — an absolute URL, an "uploads/…" storage path, or a filename with
 * an image extension. That way a description that happens to contain a "|"
 * still parses as description rather than silently becoming an image path.
 */
const looksLikeImage = (s: string) =>
  /^(https?:\/\/|\/|uploads\/)/i.test(s) || /\.(jpe?g|png|webp|gif|avif|svg)$/i.test(s);

// Parse one "Title | description | image" line. The image field is optional.
function parseServiceLine(line: string): ParsedService {
  const parts = line.split("|").map((p) => p.trim());
  const title = parts[0] ?? "";
  const rest = parts.slice(1);
  const last = rest[rest.length - 1] ?? "";
  const hasImage = rest.length >= 2 && looksLikeImage(last);
  return {
    title,
    desc: (hasImage ? rest.slice(0, -1) : rest).join(" | "),
    image: hasImage ? last : "",
    slug: slugify(title),
  };
}

// Parse the "Title | description | image" services list into structured items.
export function parseServices(raw: string): ParsedService[] {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map(parseServiceLine);
}

// Serialise one item back to its line form, dropping the image field when empty
// so hand-typed "Title | description" lines stay as the editor wrote them.
export function serviceLine({ title, desc, image }: { title: string; desc: string; image: string }): string {
  return [title, desc, image].filter((p, i) => i === 0 || p !== "").join(" | ");
}

/**
 * Drop the nth service from a raw list entirely — the whole line, not just its
 * image. Blank lines and every other line are left exactly as typed, and
 * `index` counts only the non-blank lines, matching what parseServices returns.
 */
export function removeServiceLine(raw: string, index: number): string {
  let seen = -1;
  const lines = raw.split("\n").filter((line) => {
    if (!line.trim()) return true;
    seen += 1;
    return seen !== index;
  });
  // A list that is now entirely blank should be empty, not a pile of newlines.
  return lines.some((l) => l.trim()) ? lines.join("\n") : "";
}

/**
 * Replace the image on the nth service of a raw list, leaving every other line
 * (and any blank lines between them) exactly as typed. `index` counts only the
 * non-blank lines, matching what parseServices returns.
 */
export function setServiceImage(raw: string, index: number, image: string): string {
  let seen = -1;
  return raw
    .split("\n")
    .map((line) => {
      if (!line.trim()) return line;
      seen += 1;
      if (seen !== index) return line;
      return serviceLine({ ...parseServiceLine(line.trim()), image });
    })
    .join("\n");
}
