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
  heroEyebrow: "General Contracting · Project Management",
  heroTitle: "Building Ontario\nsince 1988.",
  heroSubtitle:
    "An established general contracting and project-management firm delivering quality workmanship across commercial, industrial and institutional projects.",
  introHeading:
    "A general contractor and project-management firm trusted across commercial, industrial and institutional work in Ontario.",
  introText:
    "From the first concept through to long-term care, we manage every stage, on time, on budget, and to the highest standard of workmanship.",
};

// Keys editable via /api/settings.
export const SETTINGS_KEYS = Object.keys(SETTINGS_DEFAULTS);

// Build a tel: href from a display phone string.
export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;
