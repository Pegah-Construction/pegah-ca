// Editable About-page content. Text is stored in the Setting table under the
// "about_content" key as JSON; the "What we do" image under "about_image".
// These defaults are used until an admin edits the page in the dashboard.

export type AboutContent = {
  whoWeAre: string;
  whereWeAre: string;
  whatWeDo: string; // paragraphs separated by blank lines
  pegahWill: string; // one bullet per line
  closing: string;
};

export const ABOUT_DEFAULTS: AboutContent = {
  whoWeAre:
    "Established in 1988, Pegah Construction Ltd. is a general contracting and project management firm with years of experience in the Commercial, Industrial, Residential, Transportation, Recreational, Retail, and Historical Building sectors. Our staff has educational backgrounds in Civil Engineering, business administration, interior decoration, electrical technology, carpentry, and computer graphics. They are familiar with all industry-standard construction and administration computer programs.",
  whereWeAre:
    "Pegah Construction Ltd. has been active in Ontario and has gained a solid reputation for providing quality workmanship and being an industrious team-player.",
  whatWeDo: [
    "Pegah Construction Ltd. has long recognized the opportunities of the Design-Build process and, through targeted business planning, has been involved in a large number of projects delivered through the Design/Build, Design/Build/Finance/Operate, Design/Build/Maintain mechanisms. Our business strategy has been to accrue experience working both as the Owner's Consultant/Agent and also as the Design/Builder's Consultant.",
    "Working with our customers from the very start of their investment, we can help develop the initial concept, plan funding, and add value, from the initial concepts through to detailed designs. When it comes to delivering the asset, we can project manage the construction. We will be taking care of procurement and relationships with contractors as well as actual commissioning.",
    "Once the asset is commissioned, we offer long-term care and support services, from maintenance to specialist support services. Pegah Construction Ltd. will enhance your concepts, working with your design team to create exceptionally appealing and economical projects.",
    "Pegah Construction Ltd. is committed to excellence and specializes in custom work, performed to the highest quality workmanship. Pegah Construction Ltd. brings skills in project management, together with knowledge and experience in the processes of controlling and directing construction. Pegah Construction Ltd. will complete your project on time and on budget.",
  ].join("\n\n"),
  pegahWill: [
    'Be responsible for the site and will be "the Constructor" for the project.',
    "Prepare a detailed schedule for all trades involved and review that with you and your design team.",
    "Maintain and promote safety through enforcing Pegah's and local authorities' safety policies.",
    "Manage the project; review work of trades, coordinate shop drawings, arrange meetings, and prepare minutes of the meetings.",
  ].join("\n"),
  closing:
    "Rely on Pegah Construction Ltd. years of construction experience, agility, reliability, dedication, service, and quality workmanship.",
};

export function mergeAboutContent(raw: string | null | undefined): AboutContent {
  if (!raw) return ABOUT_DEFAULTS;
  try {
    const p = JSON.parse(raw) as Partial<AboutContent>;
    return {
      whoWeAre: p.whoWeAre ?? ABOUT_DEFAULTS.whoWeAre,
      whereWeAre: p.whereWeAre ?? ABOUT_DEFAULTS.whereWeAre,
      whatWeDo: p.whatWeDo ?? ABOUT_DEFAULTS.whatWeDo,
      pegahWill: p.pegahWill ?? ABOUT_DEFAULTS.pegahWill,
      closing: p.closing ?? ABOUT_DEFAULTS.closing,
    };
  } catch {
    return ABOUT_DEFAULTS;
  }
}

// Split helpers for rendering.
export const toParagraphs = (s: string) => s.split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean);
export const toLines = (s: string) => s.split("\n").map((t) => t.trim()).filter(Boolean);
