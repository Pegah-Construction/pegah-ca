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
