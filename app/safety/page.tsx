import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import SafetyImage from "@/components/SafetyImage";

export const metadata: Metadata = {
  title: "Health & Safety | Pegah Construction Ltd.",
};

const POLICIES = [
  "Health and Safety Policy",
  "Environmental Policy",
  "Harassment, Discrimination & Workplace Violence Policy",
  "Fitness for Duty Policy",
  "Return to Work and Re-Employment Policy",
  "Accessibility for Ontarians with Disabilities Policy",
];

export default function SafetyPage() {
  return (
    <PageShell
      eyebrow="Health, Safety & Environment"
      title="Health & Safety"
      intro="Pegah Construction Ltd. has a long-standing Health, Safety & Environment (HSE) commitment to the highest standards for the health and safety of our employees, customers, and contractors as well as to the protection of the environment in the communities in which we live and work."
    >
      {/* Policies + photo */}
      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        <div>
          <p className="text-lg leading-relaxed text-concrete-600">
            We recognize the right to a safe work environment through six workplace policies which we
            maintain and update regularly:
          </p>
          <ul className="mt-4 space-y-2.5">
            {POLICIES.map((policy) => (
              <li key={policy} className="flex items-start gap-3 text-concrete-600">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                <span className="leading-relaxed">{policy}</span>
              </li>
            ))}
          </ul>
        </div>
        <SafetyImage />
      </div>

      {/* Procore + JHSC + recognitions */}
      <div className="mt-12 max-w-3xl space-y-6 text-lg leading-relaxed text-concrete-600">
        <p>
          Pegah Construction Ltd. captures its own performance data via Procore, an online platform that
          provides immediate consolidation of HSE information. Accessible by all employees, Procore monitors
          reporting of HSE events and risk identification reports, facilitates investigations, manages remedial
          work plans, shows improvement suggestions, and assists HSE reports and data analysis.
        </p>
        <p>
          Our well-established Joint Health and Safety Committee (JHSC) actively inspects our workplaces for
          compliance and investigates all incidents and high potential identified risks reports, to ensure
          proactive and corrective measures are implemented.
        </p>
        <div className="space-y-3 border-t border-concrete-200 pt-6 text-base">
          <p>
            Pegah Construction Ltd. has been COR&trade; certified since March 29, 2019{" "}
            (
            <a href="https://www.ihsa.ca/cor-home" target="_blank" rel="noopener noreferrer" className="text-brand-700 underline underline-offset-2 hover:text-brand-800">
              ihsa.ca/cor-home
            </a>
            ).
          </p>
          <p>
            Pegah Construction Ltd. is recognized by{" "}
            <a href="https://ogca.ca/" target="_blank" rel="noopener noreferrer" className="text-brand-700 underline underline-offset-2 hover:text-brand-800">
              OGCA
            </a>{" "}
            for Zero Injury Frequency from 2004&nbsp;&ndash;&nbsp;2022 (500K Hours) and as a WSIB Health and
            Safety Excellence Program Member 2022.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
