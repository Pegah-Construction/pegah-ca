// Editable Health & Safety page content. Stored in the Setting table under the
// "safety_content" key as JSON. These defaults are used until an admin edits it.

export type SafetyContent = {
  intro: string; // hero intro paragraph
  stats: string; // one per line, "value | label"
  commitment: string; // paragraphs (blank line between), "Our HSE Commitment"
  policy: string; // one per line, "Title | description"
  duties: string; // one bullet per line, "Key Duties as Constructor"
  programEval: string; // paragraphs (blank line between)
  certifications: string; // one per line, "Title | description"
  resources: string; // one per line, "Label | url"
};

export const SAFETY_DEFAULTS: SafetyContent = {
  intro:
    "Pegah Construction Ltd. has a long-standing Health, Safety & Environment (HSE) commitment to the highest standards for the health and safety of our employees, customers, and contractors, as well as to the protection of the environment in the communities in which we live and work.",
  stats: [
    "570K+ | Hours zero lost time",
    "95% | COR™ audit score 2025",
    "21 | Years zero injury",
    "19 | Workplace policies",
  ].join("\n"),
  commitment: [
    "We outline our commitment to workplace health and safety, emphasizing the right of all workers to a safe and healthy environment through 19 comprehensive workplace policies.",
    "Pegah Construction Ltd. captures its own performance data via Procore, an online platform that provides immediate consolidation of HSE information. Accessible by all employees, Procore monitors reporting of HSE events and risk identification reports, facilitates investigations, manages remedial work plans, tracks improvement suggestions, and assists with HSE reports and data analysis.",
  ].join("\n\n"),
  policy: [
    "Commitment to Safety | We pledge to provide a healthy and safe work environment, prevent occupational illnesses and injuries, and continuously meet or exceed legislative requirements and industry standards.",
    "Hazard Management | Our actions include hazard and risk management, analysis, control, communication of potential hazards, maintaining safe work practices, and providing suitable personal protective equipment.",
    "Inclusive Safety System | Our health and safety management system is developed with input from all relevant parties, including the Joint Health and Safety Committee (JHSC), and is reviewed regularly to ensure proactive and corrective measures are implemented.",
    "Accountability | Duties and responsibilities of all workplace parties are clearly defined, with a commitment to hold everyone accountable for safety.",
    "Quality and Safety | Our goal is to deliver quality construction while prioritizing safety, requiring active participation in accident/incident prevention from all team members.",
  ].join("\n"),
  duties: [
    "Compliance with the Occupational Health and Safety Act (OHSA) and its regulations by all employers and workers.",
    "Protection of workers' health and safety on all projects.",
    "Selection or establishment of a health and safety representative or JHSC.",
    "Notification of the Ministry of Labour, Training and Skills Development (MLTSD) about projects, accidents, fatalities, or occurrences as required by law.",
    "Provision of a list of designated substances to contractors/subcontractors before contracts are signed.",
    "Establishment and posting of written emergency procedures.",
    "Appointment of a supervisor for projects with five or more workers.",
  ].join("\n"),
  programEval: [
    "Our well-established Joint Health and Safety Committee (JHSC) actively inspects our workplaces for compliance and investigates all incidents and high-potential identified risk reports, to ensure proactive and corrective measures are implemented.",
    "Program effectiveness is evaluated through regular meetings, inspections, and audits. Health and safety reporting is managed via Procore software for real-time tracking and analysis.",
    "Every three years, an external audit is performed for COR™ certification by an approved IHSA auditor to ensure our standards meet or exceed industry requirements.",
  ].join("\n\n"),
  certifications: [
    "COR™ Certified | COR™ certified since March 29, 2019. Recertified March 2025 with a score of 95% (valid until March 2028).",
    "Zero Lost Time Injury | Recognized by OGCA for achieving Zero Lost Time Injury from 2004–2025 (570K+ hours).",
    "WSIB Excellence Program | WSIB Health and Safety Excellence Program Member 2022–2024, demonstrating commitment to continuous improvement in workplace safety.",
  ].join("\n"),
  resources: [
    "Infrastructure Health and Safety Association | https://www.ihsa.ca/",
    "Ontario Ministry of Labour – Workplace Health & Safety | https://www.ontario.ca/page/workplace-health-and-safety",
    "Ontario Occupational Health and Safety Act | https://www.ontario.ca/laws/statute/90o01",
    "Workplace Safety and Insurance Act | https://www.ontario.ca/laws/statute/97w16",
    "Canadian Centre for Occupational Health & Safety | https://www.ccohs.ca/",
    "Occupational Health Clinics for Ontario Workers | https://www.ohcow.on.ca/",
  ].join("\n"),
};

export function mergeSafetyContent(raw: string | null | undefined): SafetyContent {
  if (!raw) return SAFETY_DEFAULTS;
  try {
    const p = JSON.parse(raw) as Partial<SafetyContent>;
    return {
      intro: p.intro ?? SAFETY_DEFAULTS.intro,
      stats: p.stats ?? SAFETY_DEFAULTS.stats,
      commitment: p.commitment ?? SAFETY_DEFAULTS.commitment,
      policy: p.policy ?? SAFETY_DEFAULTS.policy,
      duties: p.duties ?? SAFETY_DEFAULTS.duties,
      programEval: p.programEval ?? SAFETY_DEFAULTS.programEval,
      certifications: p.certifications ?? SAFETY_DEFAULTS.certifications,
      resources: p.resources ?? SAFETY_DEFAULTS.resources,
    };
  } catch {
    return SAFETY_DEFAULTS;
  }
}

// Parse helpers for rendering.
export const toParagraphs = (s: string) => s.split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean);
export const toLines = (s: string) => s.split("\n").map((t) => t.trim()).filter(Boolean);
export const toPairs = (s: string) =>
  toLines(s).map((line) => {
    const i = line.indexOf("|");
    if (i === -1) return { a: line.trim(), b: "" };
    return { a: line.slice(0, i).trim(), b: line.slice(i + 1).trim() };
  });
