// Editable org / contact settings, stored in the Setting key/value table and
// managed from the admin Settings page. These defaults are used until edited.

export const SETTINGS_DEFAULTS: Record<string, string> = {
  companyName: "Pegah Construction Ltd.",
  phone: "(416) 739-9300",
  email: "info@pegah.ca",
  estimatingEmail: "estimating@pegah.ca",
  addressLine1: "5050 Dufferin Street, Suite 120",
  addressLine2: "Toronto, Ontario M3H 5T5",
  contactTitle: "Let's build something.",
  contactIntro: "Tell us about your project and our team will get back to you.",
  // Home / landing page
  heroEyebrow: "Established 1988",
  heroTitle: "Building Excellence",
  heroSubtitle: "General Contracting & Project Management serving Ontario since 1988",
  introHeading:
    "A general contractor and project-management firm trusted across commercial, industrial and institutional work in Ontario.",
  introText:
    "From the first concept through to long-term care, we manage every stage, on time, on budget, and to the highest standard of workmanship.",
  // Services page + the services section on the home page
  servicesEyebrow: "What we do",
  servicesTitle: "Services",
  // {count} is replaced with the number of services actually in the list below,
  // so the heading can't go stale when a service is added or removed.
  servicesHomeHeading: "{count} ways we deliver your project.",
  servicesIntro: "From initial concept through to long-term care, we manage every stage of delivery.",
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

// Parse the "Title | description" services list into structured items.
export function parseServices(raw: string): { title: string; desc: string; slug: string }[] {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const i = line.indexOf("|");
      const title = (i === -1 ? line : line.slice(0, i)).trim();
      const desc = i === -1 ? "" : line.slice(i + 1).trim();
      return { title, desc, slug: slugify(title) };
    });
}
