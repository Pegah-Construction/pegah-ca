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
  // Services page
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
