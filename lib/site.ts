// Central content for the site. Edit copy and data here.

export const company = {
  name: "Pegah Construction Ltd.",
  shortName: "Pegah",
  established: "1988",
  phone: "416 739 9300",
  phoneHref: "tel:+14167399300",
  email: "info@pegah.ca",
  estimatingEmail: "estimating@pegah.ca",
  address: {
    line1: "5050 Dufferin Street, Suite 120",
    line2: "Toronto, Ontario M3H 5T5",
  },
  region: "Southern Ontario",
};

export type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};

export const nav: NavItem[] = [
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/projects" },
  {
    label: "Tenders",
    href: "/tenders",
    children: [
      { label: "Active Tenders", href: "/tenders" },
      { label: "Subcontractor Registration", href: "/subcontractors/register" },
    ],
  },
  { label: "Blog", href: "/blog" },
  { label: "Safety", href: "/safety" },
  { label: "Contact", href: "/contact" },
];

export type Stat = { value: string; label: string; href: string };

export const stats: Stat[] = [
  { value: "1988", label: "Established", href: "/about" },
  { value: "35+", label: "Years building", href: "/about" },
  { value: "500+", label: "Projects delivered", href: "/projects" },
  { value: "7", label: "Sectors served", href: "/services" },
];

export type Leader = { name: string; title: string; bio: string };

export const leadership: Leader[] = [
  {
    name: "Placeholder Name",
    title: "President",
    bio: "Placeholder bio — outline this leader's background, years with the company, and the areas of the business they oversee. Replace with the real profile and headshot.",
  },
  {
    name: "Placeholder Name",
    title: "Vice President",
    bio: "Placeholder bio — outline this leader's background, years with the company, and the areas of the business they oversee. Replace with the real profile and headshot.",
  },
];

export type Project = {
  slug: string;
  name: string;
  sector: string;
  location: string;
  year: string;
  services: string;
  size: string;
  summary: string;
  description: string[];
  gallery: number;
};

export const projects: Project[] = [
  {
    slug: "harbourside-commercial-centre",
    name: "Harbourside Commercial Centre",
    sector: "Commercial",
    location: "Toronto, ON",
    year: "2023",
    services: "Design–Build",
    size: "—",
    summary:
      "A multi-tenant commercial centre delivered on an accelerated design-build schedule.",
    description: [
      "Placeholder project narrative. Describe the brief, the client's goals, and the constraints the team worked within — site conditions, schedule, budget and any phasing requirements.",
      "Outline how Pegah managed the work: the trades coordinated, the milestones hit, and the result handed over. Replace this copy and the placeholder imagery with the real case study.",
    ],
    gallery: 3,
  },
  {
    slug: "northfield-distribution-facility",
    name: "Northfield Distribution Facility",
    sector: "Industrial",
    location: "Mississauga, ON",
    year: "2022",
    services: "General Contracting",
    size: "—",
    summary:
      "A large-footprint distribution and warehousing facility built to operational spec.",
    description: [
      "Placeholder project narrative. Summarise the industrial scope — structure, building envelope, loading, and any specialist mechanical or electrical systems.",
      "Note the delivery approach and the outcome for the client. Replace with the real project details and photography.",
    ],
    gallery: 3,
  },
  {
    slug: "maple-grove-residences",
    name: "Maple Grove Residences",
    sector: "Residential",
    location: "Vaughan, ON",
    year: "2023",
    services: "Construction Management",
    size: "—",
    summary:
      "A multi-unit residential development managed from groundwork to occupancy.",
    description: [
      "Placeholder project narrative. Describe the residential program, unit mix and finishes, and the coordination required across trades.",
      "Capture how the team kept the project on schedule and on budget. Replace with the real case study.",
    ],
    gallery: 3,
  },
  {
    slug: "lakeshore-transit-hub",
    name: "Lakeshore Transit Hub",
    sector: "Transportation",
    location: "Hamilton, ON",
    year: "2021",
    services: "General Contracting",
    size: "—",
    summary:
      "A transit interchange built to keep passengers moving through a live corridor.",
    description: [
      "Placeholder project narrative. Outline the transportation scope and the challenges of building around active operations and the public.",
      "Describe the safety planning and phasing that made delivery possible. Replace with the real details.",
    ],
    gallery: 3,
  },
  {
    slug: "riverbend-recreation-complex",
    name: "Riverbend Recreation Complex",
    sector: "Recreational",
    location: "Markham, ON",
    year: "2022",
    services: "Design–Build",
    size: "—",
    summary:
      "A community recreation complex delivered as a single accountable design-build.",
    description: [
      "Placeholder project narrative. Describe the recreational facilities, the public-use requirements and the architectural intent.",
      "Note how design-build streamlined decisions and delivery. Replace with the real case study.",
    ],
    gallery: 3,
  },
  {
    slug: "queen-street-retail-pavilion",
    name: "Queen Street Retail Pavilion",
    sector: "Retail",
    location: "Toronto, ON",
    year: "2023",
    services: "General Contracting",
    size: "—",
    summary:
      "A street-level retail pavilion built to a tight downtown timeline.",
    description: [
      "Placeholder project narrative. Summarise the retail fit-out scope, the storefront and any tenant-coordination requirements.",
      "Describe the logistics of building in a busy urban setting. Replace with the real details.",
    ],
    gallery: 3,
  },
  {
    slug: "heritage-mill-restoration",
    name: "Heritage Mill Restoration",
    sector: "Historical",
    location: "Cambridge, ON",
    year: "2020",
    services: "Restoration · GC",
    size: "—",
    summary:
      "Careful restoration of a heritage structure for contemporary use.",
    description: [
      "Placeholder project narrative. Describe the heritage constraints, the conservation approach and the adaptive-reuse program.",
      "Note the specialist trades involved and the result. Replace with the real case study.",
    ],
    gallery: 3,
  },
  {
    slug: "parkview-corporate-campus",
    name: "Parkview Corporate Campus",
    sector: "Commercial",
    location: "Oakville, ON",
    year: "2024",
    services: "Project Management",
    size: "—",
    summary:
      "A corporate campus delivered under full project-management oversight.",
    description: [
      "Placeholder project narrative. Outline the corporate program, the multiple buildings or phases, and the stakeholder coordination.",
      "Describe how project management kept procurement and schedule aligned. Replace with the real details.",
    ],
    gallery: 3,
  },
];

// Homepage spotlights the first three.
export const featuredProjects = projects.slice(0, 3);

export type Service = { slug: string; title: string; desc: string };

export const services: Service[] = [
  {
    slug: "general-contracting",
    title: "General Contracting",
    desc: "Responsible for the site as the Constructor — trades, schedule and delivery.",
  },
  {
    slug: "project-management",
    title: "Project Management",
    desc: "Procurement, contractor relationships, coordination and commissioning.",
  },
  {
    slug: "design-build",
    title: "Design–Build",
    desc: "One accountable team from initial concept through detailed design and build.",
  },
  {
    slug: "care-and-support",
    title: "Care & Support",
    desc: "Long-term maintenance and specialist support once the asset is live.",
  },
];

export const sectors: string[] = [
  "Commercial",
  "Industrial",
  "Residential",
  "Transportation",
  "Recreational",
  "Retail",
  "Historical",
];
